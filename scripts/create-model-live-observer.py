#!/usr/bin/env python3
"""Generate a site-scoped live research observer from the bundled template."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


SCHEMA_VERSION = 3
EXPECTED_KEYS = {
    "schemaVersion",
    "bridgePort",
    "displayName",
    "allowedOrigins",
    "pageKinds",
    "safeQueryValuePatterns",
    "safeDataValueAttributes",
    "developmentNetworkCapture",
}
NETWORK_CAPTURE_KEYS = {
    "enabled",
    "graphqlEndpointPaths",
    "maximumPendingRequests",
    "maximumRequestBodyBytes",
    "maximumResponseBodyBytes",
    "maximumSessionBodyBytes",
}
MAX_REQUEST_BODY_BYTES = 16 * 1024 * 1024
MAX_RESPONSE_BODY_BYTES = 64 * 1024 * 1024
MAX_SESSION_BODY_BYTES = 512 * 1024 * 1024
SENSITIVE_NAME = re.compile(
    r"(?:^|[-_.])(auth|authorization|challenge|code|credential|csrf|jwt|key|mfa|nonce|otp|password|secret|session|signature|sig|sso|state|ticket|token|verifier)(?:$|[-_.])",
    re.IGNORECASE,
)
SENSITIVE_COMPACT_NAME = re.compile(
    r"^(?:(?:access|api|auth|authenticity|client|csrf|id|mfa|otp|private|public|refresh|session)?(?:code|key|secret|token|verifier)|(?:access|auth|client|csrf|private|refresh|session)id|authorization|challenge|credential|jwt|nonce|password|signature|sig|sso|state|ticket)$",
    re.IGNORECASE,
)
SAFE_NAME = re.compile(r"^[a-z][a-z0-9-]{0,63}$")
SAFE_QUERY_NAME = re.compile(r"^[a-z0-9_.-]{1,80}$", re.IGNORECASE)
SAFE_DATA_NAME = re.compile(r"^data-[a-z0-9_.-]{1,74}$")


class ConfigError(ValueError):
    """Raised when the explicit observer policy is invalid."""


def strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ConfigError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_config(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as stream:
            value = json.load(stream, object_pairs_hook=strict_object)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise ConfigError(f"cannot read strict JSON config: {error}") from error
    if not isinstance(value, dict):
        raise ConfigError("config must be a JSON object")
    return value


def canonical_origin(value: Any) -> str:
    if not isinstance(value, str) or not value:
        raise ConfigError("each allowed origin must be a non-empty string")
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as error:
        raise ConfigError(f"invalid origin {value!r}: {error}") from error
    if parsed.scheme not in {"http", "https"}:
        raise ConfigError(f"origin must use http or https: {value!r}")
    if parsed.username is not None or parsed.password is not None:
        raise ConfigError(f"origin must not contain credentials: {value!r}")
    if not parsed.hostname or parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
        raise ConfigError(f"origin must contain only scheme, host, and optional port: {value!r}")
    try:
        host = parsed.hostname.encode("idna").decode("ascii").lower()
    except UnicodeError as error:
        raise ConfigError(f"origin host is not canonicalizable: {value!r}") from error
    if ":" in host:
        host = f"[{host}]"
    default_port = 80 if parsed.scheme == "http" else 443
    authority = host if port in {None, default_port} else f"{host}:{port}"
    canonical = f"{parsed.scheme}://{authority}"
    if value != canonical:
        raise ConfigError(f"origin must be canonical; use {canonical!r} instead of {value!r}")
    return canonical


def full_match_pattern(name: str, value: Any) -> str:
    if not isinstance(value, str) or not (2 <= len(value) <= 256):
        raise ConfigError(f"pattern for {name!r} must be a 2-256 character string")
    if not value.startswith("^") or not value.endswith("$"):
        raise ConfigError(f"pattern for {name!r} must be explicitly anchored with ^ and $")
    if any(character in value for character in "()|") or re.search(r"\\[1-9]", value):
        raise ConfigError(
            f"pattern for {name!r} must use the bounded simple-regex subset without groups, alternation, or backreferences"
        )
    for escape in re.findall(r"\\(.)", value):
        if escape not in {".", "/", "\\", "-", "+", "?", "*", "^", "$", "[", "]", "{", "}"}:
            raise ConfigError(
                f"pattern for {name!r} uses escape \\{escape}, which is outside the shared Python/JavaScript subset"
            )
    body = value[1:-1]
    if body.endswith(".*"):
        body = body[:-2]
    in_class = False
    escaped = False
    for character in body:
        if escaped:
            escaped = False
        elif character == "\\":
            escaped = True
        elif character == "[":
            in_class = True
        elif character == "]":
            in_class = False
        elif not in_class and character in "*+?":
            raise ConfigError(f"pattern for {name!r} has an unbounded or optional quantifier outside the safe suffix")
    quantifiers = list(re.finditer(r"\{(\d+)(?:,(\d*))?\}", body))
    if len(quantifiers) > 4:
        raise ConfigError(f"pattern for {name!r} has too many bounded quantifiers")
    for quantifier in quantifiers:
        lower = int(quantifier.group(1))
        upper_text = quantifier.group(2)
        if upper_text == "":
            raise ConfigError(f"pattern for {name!r} has an unbounded numeric quantifier")
        upper = lower if upper_text is None else int(upper_text)
        if lower > upper or upper > 512:
            raise ConfigError(f"pattern for {name!r} has a quantifier outside 0-512")
    try:
        re.compile(value)
    except re.error as error:
        raise ConfigError(f"invalid pattern for {name!r}: {error}") from error
    return value


def endpoint_path(value: Any, index: int) -> str:
    if not isinstance(value, str) or not (1 <= len(value) <= 2048) or not value.startswith("/"):
        raise ConfigError(f"developmentNetworkCapture.graphqlEndpointPaths[{index}] must be an absolute path")
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or parsed.path != value:
        raise ConfigError(
            f"developmentNetworkCapture.graphqlEndpointPaths[{index}] must contain only an absolute path"
        )
    if any(ord(character) < 33 or ord(character) > 126 for character in value):
        raise ConfigError(f"developmentNetworkCapture.graphqlEndpointPaths[{index}] contains invalid characters")
    return value


def bounded_integer(value: Any, name: str, minimum: int, maximum: int) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or not minimum <= value <= maximum:
        raise ConfigError(f"{name} must be an integer from {minimum} through {maximum}")
    return value


def validate_config(value: dict[str, Any]) -> dict[str, Any]:
    actual = set(value)
    if actual != EXPECTED_KEYS:
        missing = sorted(EXPECTED_KEYS - actual)
        extra = sorted(actual - EXPECTED_KEYS)
        raise ConfigError(f"config keys mismatch; missing={missing}, extra={extra}")
    if value["schemaVersion"] != SCHEMA_VERSION:
        raise ConfigError(f"schemaVersion must be {SCHEMA_VERSION}")
    display_name = value["displayName"]
    if not isinstance(display_name, str) or not (1 <= len(display_name) <= 48) or any(ord(char) < 32 for char in display_name):
        raise ConfigError("displayName must be 1-48 printable characters")
    bridge_port = bounded_integer(value["bridgePort"], "bridgePort", 1024, 65535)

    origins = value["allowedOrigins"]
    if not isinstance(origins, list) or not (1 <= len(origins) <= 16):
        raise ConfigError("allowedOrigins must contain 1-16 canonical origins")
    canonical_origins = [canonical_origin(origin) for origin in origins]
    if len(set(canonical_origins)) != len(canonical_origins):
        raise ConfigError("allowedOrigins must not contain duplicates")

    page_kinds = value["pageKinds"]
    if not isinstance(page_kinds, list) or len(page_kinds) > 64:
        raise ConfigError("pageKinds must be an array with at most 64 entries")
    checked_page_kinds: list[dict[str, str]] = []
    seen_kinds: set[str] = set()
    for index, item in enumerate(page_kinds):
        if not isinstance(item, dict) or set(item) != {"kind", "pathPattern"}:
            raise ConfigError(f"pageKinds[{index}] must contain only kind and pathPattern")
        kind = item["kind"]
        if not isinstance(kind, str) or not SAFE_NAME.fullmatch(kind) or kind in seen_kinds:
            raise ConfigError(f"pageKinds[{index}].kind is invalid or duplicated")
        pattern = full_match_pattern(f"pageKinds[{index}].pathPattern", item["pathPattern"])
        seen_kinds.add(kind)
        checked_page_kinds.append({"kind": kind, "pathPattern": pattern})

    query_patterns = value["safeQueryValuePatterns"]
    if not isinstance(query_patterns, dict) or len(query_patterns) > 32:
        raise ConfigError("safeQueryValuePatterns must be an object with at most 32 entries")
    checked_query_patterns: dict[str, str] = {}
    for name in sorted(query_patterns):
        compact_name = re.sub(r"[^a-z0-9]", "", name.lower()) if isinstance(name, str) else ""
        if (not isinstance(name, str) or not SAFE_QUERY_NAME.fullmatch(name) or
                SENSITIVE_NAME.search(name) or SENSITIVE_COMPACT_NAME.fullmatch(compact_name)):
            raise ConfigError(f"query allowlist name is invalid or sensitive: {name!r}")
        checked_query_patterns[name] = full_match_pattern(name, query_patterns[name])

    data_attributes = value["safeDataValueAttributes"]
    if not isinstance(data_attributes, list) or len(data_attributes) > 32:
        raise ConfigError("safeDataValueAttributes must be an array with at most 32 entries")
    checked_data: list[str] = []
    for name in data_attributes:
        compact_name = re.sub(r"[^a-z0-9]", "", name.lower()) if isinstance(name, str) else ""
        if (not isinstance(name, str) or not SAFE_DATA_NAME.fullmatch(name) or
                SENSITIVE_NAME.search(name) or SENSITIVE_COMPACT_NAME.fullmatch(compact_name.removeprefix("data"))):
            raise ConfigError(f"data attribute allowlist name is invalid or sensitive: {name!r}")
        if name in checked_data:
            raise ConfigError(f"duplicate data attribute allowlist name: {name!r}")
        checked_data.append(name)

    network_capture = value["developmentNetworkCapture"]
    if not isinstance(network_capture, dict) or set(network_capture) != NETWORK_CAPTURE_KEYS:
        raise ConfigError(
            "developmentNetworkCapture must contain only enabled, graphqlEndpointPaths, "
            "maximumPendingRequests, maximumRequestBodyBytes, maximumResponseBodyBytes, and maximumSessionBodyBytes"
        )
    enabled = network_capture["enabled"]
    if not isinstance(enabled, bool):
        raise ConfigError("developmentNetworkCapture.enabled must be boolean")
    paths = network_capture["graphqlEndpointPaths"]
    if not isinstance(paths, list) or len(paths) > 32 or (enabled and not paths):
        raise ConfigError(
            "developmentNetworkCapture.graphqlEndpointPaths must contain 1-32 paths when capture is enabled"
        )
    checked_paths = [endpoint_path(path, index) for index, path in enumerate(paths)]
    if len(set(checked_paths)) != len(checked_paths):
        raise ConfigError("developmentNetworkCapture.graphqlEndpointPaths must not contain duplicates")
    maximum_pending = bounded_integer(
        network_capture["maximumPendingRequests"],
        "developmentNetworkCapture.maximumPendingRequests",
        1,
        256,
    )
    maximum_request = bounded_integer(
        network_capture["maximumRequestBodyBytes"],
        "developmentNetworkCapture.maximumRequestBodyBytes",
        1,
        MAX_REQUEST_BODY_BYTES,
    )
    maximum_response = bounded_integer(
        network_capture["maximumResponseBodyBytes"],
        "developmentNetworkCapture.maximumResponseBodyBytes",
        1,
        MAX_RESPONSE_BODY_BYTES,
    )
    maximum_session = bounded_integer(
        network_capture["maximumSessionBodyBytes"],
        "developmentNetworkCapture.maximumSessionBodyBytes",
        max(maximum_request, maximum_response),
        MAX_SESSION_BODY_BYTES,
    )

    return {
        "schemaVersion": SCHEMA_VERSION,
        "bridgePort": bridge_port,
        "displayName": display_name,
        "allowedOrigins": canonical_origins,
        "pageKinds": checked_page_kinds,
        "safeQueryValuePatterns": checked_query_patterns,
        "safeDataValueAttributes": checked_data,
        "developmentNetworkCapture": {
            "enabled": enabled,
            "graphqlEndpointPaths": checked_paths,
            "maximumPendingRequests": maximum_pending,
            "maximumRequestBodyBytes": maximum_request,
            "maximumResponseBodyBytes": maximum_response,
            "maximumSessionBodyBytes": maximum_session,
        },
    }


def config_javascript(config: dict[str, Any]) -> str:
    payload = json.dumps(config, ensure_ascii=True, indent=2, sort_keys=True)
    return f'''(function initializeModelLiveObserverConfig(root) {{
  "use strict";

  const rawConfig = {payload};
  rawConfig.allowedOrigins = Object.freeze(rawConfig.allowedOrigins);
  rawConfig.pageKinds = Object.freeze(rawConfig.pageKinds.map((value) => Object.freeze(value)));
  rawConfig.safeQueryValuePatterns = Object.freeze(rawConfig.safeQueryValuePatterns);
  rawConfig.safeDataValueAttributes = Object.freeze(rawConfig.safeDataValueAttributes);
  rawConfig.developmentNetworkCapture.graphqlEndpointPaths = Object.freeze(
    rawConfig.developmentNetworkCapture.graphqlEndpointPaths
  );
  rawConfig.developmentNetworkCapture = Object.freeze(rawConfig.developmentNetworkCapture);
  const config = Object.freeze(rawConfig);

  root.ModelLiveObserverConfig = config;
  if (typeof module !== "undefined" && module.exports) {{
    module.exports = config;
  }}
}})(globalThis);
'''


def write_text(path: Path, value: str) -> None:
    path.write_text(value, encoding="utf-8", newline="\n")


def generate(config: dict[str, Any], output: Path, template: Path) -> None:
    if output.exists():
        raise ConfigError(f"output already exists; refusing to overwrite: {output}")
    if not template.is_dir():
        raise ConfigError(f"bundled template is missing: {template}")
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.copytree(template, output)
        write_text(output / "extension" / "observer-config.js", config_javascript(config))
        manifest_path = output / "extension" / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["name"] = f'{config["displayName"]} (Development)'
        manifest["description"] = "Records bounded page and configured GraphQL development evidence from one owner-selected tab to an owner-run loopback bridge."
        if config["developmentNetworkCapture"]["enabled"] and "debugger" not in manifest["permissions"]:
            manifest["permissions"].append("debugger")
        if not config["developmentNetworkCapture"]["enabled"]:
            manifest["permissions"] = [permission for permission in manifest["permissions"] if permission != "debugger"]
        manifest["action"]["default_title"] = config["displayName"]
        write_text(manifest_path, json.dumps(manifest, ensure_ascii=True, indent=2) + "\n")
        write_text(output / "observer-config.json", json.dumps(config, ensure_ascii=True, indent=2, sort_keys=True) + "\n")
    except Exception:
        shutil.rmtree(output, ignore_errors=True)
        raise


def parse_cli(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path, help="strict JSON observer policy")
    parser.add_argument("--output", type=Path, help="new generated package directory")
    parser.add_argument("--check", action="store_true", help="validate config and bundled template without writing")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_cli(sys.argv[1:] if argv is None else argv)
    if args.check == (args.output is not None):
        print("error: choose exactly one of --check or --output", file=sys.stderr)
        return 2
    template = Path(__file__).resolve().parent.parent / "assets" / "model-live-observer"
    try:
        config = validate_config(load_config(args.config.resolve()))
        if not template.is_dir():
            raise ConfigError(f"bundled template is missing: {template}")
        if args.check:
            print(f"valid: {len(config['allowedOrigins'])} allowed origin(s); no files written")
        else:
            generate(config, args.output.resolve(), template)
            print(f"created: {args.output.resolve()}")
        return 0
    except ConfigError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
