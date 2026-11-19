from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT = Path(__file__).with_name("create-model-live-observer.py")
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("create_model_live_observer", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def base_config() -> dict[str, object]:
    return {
        "schemaVersion": 3,
        "bridgePort": 43116,
        "displayName": "Example Observer",
        "allowedOrigins": ["https://example.com", "http://localhost:8080"],
        "pageKinds": [{"kind": "records", "pathPattern": "^/records.*$"}],
        "safeQueryValuePatterns": {},
        "safeDataValueAttributes": ["data-action", "data-id"],
        "developmentNetworkCapture": {
            "enabled": True,
            "graphqlEndpointPaths": ["/graphql"],
            "maximumPendingRequests": 64,
            "maximumRequestBodyBytes": 16 * 1024 * 1024,
            "maximumResponseBodyBytes": 64 * 1024 * 1024,
            "maximumSessionBodyBytes": 512 * 1024 * 1024,
        },
    }


class ConfigTests(unittest.TestCase):
    def test_valid_config_keeps_query_values_denied_by_default(self) -> None:
        result = MODULE.validate_config(base_config())
        self.assertEqual(result["safeQueryValuePatterns"], {})
        self.assertEqual(result["allowedOrigins"][1], "http://localhost:8080")

    def test_origin_must_be_canonical(self) -> None:
        value = base_config()
        value["allowedOrigins"] = ["https://EXAMPLE.com/"]
        with self.assertRaisesRegex(MODULE.ConfigError, "canonical"):
            MODULE.validate_config(value)

    def test_sensitive_allowlists_are_rejected(self) -> None:
        value = base_config()
        value["safeQueryValuePatterns"] = {"session-token": "^[a-z]+$"}
        with self.assertRaisesRegex(MODULE.ConfigError, "sensitive"):
            MODULE.validate_config(value)

        compact_query = base_config()
        compact_query["safeQueryValuePatterns"] = {"accessToken": "^[a-z]+$"}
        with self.assertRaisesRegex(MODULE.ConfigError, "sensitive"):
            MODULE.validate_config(compact_query)

        compact_attribute = base_config()
        compact_attribute["safeDataValueAttributes"] = ["data-accesstoken"]
        with self.assertRaisesRegex(MODULE.ConfigError, "sensitive"):
            MODULE.validate_config(compact_attribute)

    def test_backtracking_prone_patterns_are_rejected(self) -> None:
        value = base_config()
        value["safeQueryValuePatterns"] = {"page": "^a*a*a*b$"}
        with self.assertRaisesRegex(MODULE.ConfigError, "quantifier"):
            MODULE.validate_config(value)

        incompatible = base_config()
        incompatible["safeQueryValuePatterns"] = {"page": r"^\A[0-9]{1,8}$"}
        with self.assertRaisesRegex(MODULE.ConfigError, "Python/JavaScript subset"):
            MODULE.validate_config(incompatible)

        unicode_mismatch = base_config()
        unicode_mismatch["safeQueryValuePatterns"] = {"page": r"^\d{1,8}$"}
        with self.assertRaisesRegex(MODULE.ConfigError, "Python/JavaScript subset"):
            MODULE.validate_config(unicode_mismatch)

    def test_strict_json_rejects_malformed_and_duplicate_keys(self) -> None:
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as temporary:
            root = Path(temporary)
            malformed = root / "malformed.json"
            malformed.write_text('{"schemaVersion": 3,', encoding="utf-8", newline="\n")
            with self.assertRaisesRegex(MODULE.ConfigError, "strict JSON"):
                MODULE.load_config(malformed)

            duplicated = root / "duplicated.json"
            duplicated.write_text('{"schemaVersion": 3, "schemaVersion": 3}', encoding="utf-8", newline="\n")
            with self.assertRaisesRegex(MODULE.ConfigError, "duplicate JSON key"):
                MODULE.load_config(duplicated)

    def test_duplicate_and_non_web_origins_are_rejected(self) -> None:
        duplicated = base_config()
        duplicated["allowedOrigins"] = ["https://example.com", "https://example.com"]
        with self.assertRaisesRegex(MODULE.ConfigError, "duplicates"):
            MODULE.validate_config(duplicated)

        restricted = base_config()
        restricted["allowedOrigins"] = ["chrome://settings"]
        with self.assertRaisesRegex(MODULE.ConfigError, "http or https"):
            MODULE.validate_config(restricted)

    def test_network_capture_requires_exact_paths_and_bounded_sizes(self) -> None:
        missing_path = base_config()
        missing_path["developmentNetworkCapture"]["graphqlEndpointPaths"] = []
        with self.assertRaisesRegex(MODULE.ConfigError, "1-32 paths"):
            MODULE.validate_config(missing_path)

        query_path = base_config()
        query_path["developmentNetworkCapture"]["graphqlEndpointPaths"] = ["/graphql?token=value"]
        with self.assertRaisesRegex(MODULE.ConfigError, "absolute path"):
            MODULE.validate_config(query_path)

        oversized = base_config()
        oversized["developmentNetworkCapture"]["maximumResponseBodyBytes"] = 64 * 1024 * 1024 + 1
        with self.assertRaisesRegex(MODULE.ConfigError, "maximumResponseBodyBytes"):
            MODULE.validate_config(oversized)

        bad_port = base_config()
        bad_port["bridgePort"] = 80
        with self.assertRaisesRegex(MODULE.ConfigError, "bridgePort"):
            MODULE.validate_config(bad_port)

    def test_generator_is_deterministic_create_only_and_writes_lf(self) -> None:
        config = MODULE.validate_config(base_config())
        template = SCRIPT.parent.parent / "assets" / "model-live-observer"
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as temporary:
            output = Path(temporary) / "observer-a"
            second_output = Path(temporary) / "observer-b"
            MODULE.generate(config, output, template)
            MODULE.generate(config, second_output, template)
            first_files = {
                path.relative_to(output).as_posix(): path.read_bytes()
                for path in output.rglob("*") if path.is_file()
            }
            second_files = {
                path.relative_to(second_output).as_posix(): path.read_bytes()
                for path in second_output.rglob("*") if path.is_file()
            }
            self.assertEqual(first_files, second_files)
            self.assertTrue(first_files)
            for raw in first_files.values():
                self.assertFalse(raw.startswith(b"\xef\xbb\xbf"))
                self.assertNotIn(b"\r", raw)

            manifest = json.loads((output / "extension" / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["name"], "Example Observer (Development)")
            self.assertIn("debugger", manifest["permissions"])
            config_js = (output / "extension" / "observer-config.js").read_bytes()
            self.assertIn(b"https://example.com", config_js)
            with self.assertRaisesRegex(MODULE.ConfigError, "refusing to overwrite"):
                MODULE.generate(config, output, template)

    def test_disabled_network_capture_does_not_request_debugger_permission(self) -> None:
        value = base_config()
        value["developmentNetworkCapture"]["enabled"] = False
        value["developmentNetworkCapture"]["graphqlEndpointPaths"] = []
        config = MODULE.validate_config(value)
        template = SCRIPT.parent.parent / "assets" / "model-live-observer"
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as temporary:
            output = Path(temporary) / "dom-only-observer"
            MODULE.generate(config, output, template)
            manifest = json.loads((output / "extension" / "manifest.json").read_text(encoding="utf-8"))
            self.assertNotIn("debugger", manifest["permissions"])

    def test_template_has_no_source_site_identity(self) -> None:
        template = SCRIPT.parent.parent / "assets" / "model-live-observer"
        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in template.rglob("*") if path.is_file()
        ).lower()
        for forbidden in ["robertsspaceindustries", "star citizen", "x-rsi-observer", "rsimodelobserver"]:
            self.assertNotIn(forbidden, combined)

    def test_partial_copy_is_removed_when_generation_fails(self) -> None:
        config = MODULE.validate_config(base_config())
        template = SCRIPT.parent.parent / "assets" / "model-live-observer"
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as temporary:
            output = Path(temporary) / "partial-observer"

            def fail_after_create(_source: Path, destination: Path) -> None:
                destination.mkdir()
                (destination / "partial.txt").write_text("partial", encoding="utf-8", newline="\n")
                raise OSError("injected copy failure")

            with mock.patch.object(MODULE.shutil, "copytree", side_effect=fail_after_create):
                with self.assertRaisesRegex(OSError, "injected copy failure"):
                    MODULE.generate(config, output, template)
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
