(function initializeObserverPolicy(root) {
  "use strict";

  const PROTOCOL_VERSION = 2;
  const CONTRACT_VERSION = "2026-11-18.2";
  const SOURCE_TRUST = "untrusted-page-content";
  const NETWORK_SOURCE_TRUST = "sensitive-development-network";
  const CONFIG = root.ModelLiveObserverConfig || (
    typeof require === "function" ? require("./observer-config.js") : null
  );
  if (!CONFIG || CONFIG.schemaVersion !== 3 || !Number.isInteger(CONFIG.bridgePort) || CONFIG.bridgePort < 1024 || CONFIG.bridgePort > 65535 ||
      !Array.isArray(CONFIG.allowedOrigins) || CONFIG.allowedOrigins.length === 0 ||
      !CONFIG.developmentNetworkCapture || typeof CONFIG.developmentNetworkCapture.enabled !== "boolean") {
    throw new Error("INVALID_OBSERVER_CONFIG");
  }
  const ALLOWED_ORIGINS = new Set(CONFIG.allowedOrigins);
  const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;
  const MAX_REQUEST_BYTES = 72 * 1024 * 1024;
  const MAX_NETWORK_REQUEST_BODY_BYTES = 16 * 1024 * 1024;
  const MAX_NETWORK_RESPONSE_BODY_BYTES = 64 * 1024 * 1024;
  const MAX_NETWORK_SESSION_BODY_BYTES = 512 * 1024 * 1024;
  const MAX_NETWORK_HEADERS = 512;
  const MAX_NETWORK_HEADERS_BYTES = 2 * 1024 * 1024;
  const MAX_NETWORK_METADATA_BYTES = 1024 * 1024;
  const MAX_CAPTURE_NODES = 50000;
  const MAX_CAPTURE_DEPTH = 128;
  const MAX_ELEMENT_ATTRIBUTES = 128;
  const MAX_URL_CHARS = 16384;
  const MAX_PATTERN_INPUT_CHARS = 4096;
  const MAX_QUERY_VALUE_CHARS = 512;
  const MAX_RAW_TEXT_CHARS = 65536;
  const MAX_RAW_ATTRIBUTE_CHARS = 4096;
  const MUTATION_DEBOUNCE_MS = 1000;
  const INTERACTION_SNAPSHOT_DELAY_MS = 250;
  const MAX_TARGET_TEXT = 240;
  const MAX_ATTRIBUTE_VALUE = 400;
  const MAX_DATA_ATTRIBUTES = 16;

  const SAFE_QUERY_VALUE_PATTERNS = new Map(
    Object.entries(CONFIG.safeQueryValuePatterns || {}).map(([name, pattern]) => [name, new RegExp(pattern)])
  );
  const SENSITIVE_NAME = /(?:^|[-_.])(auth|authorization|challenge|code|credential|csrf|jwt|key|mfa|nonce|otp|password|secret|session|signature|sig|sso|state|ticket|token|verifier)(?:$|[-_.])/i;
  const SENSITIVE_COMPACT_NAME = /^(?:(?:access|api|auth|authenticity|client|csrf|id|mfa|otp|private|public|refresh|session)?(?:code|key|secret|token|verifier)|(?:access|auth|client|csrf|private|refresh|session)id|authorization|challenge|credential|jwt|nonce|password|signature|sig|sso|state|ticket)$/i;
  const CREDENTIAL_LIKE_PATTERNS = [
    /(?:^|[\r\n>])\s*authorization\s*:\s*(?:bearer|basic)\s+[a-z0-9._~+/=-]{8,}/i,
    /(?:^|[\r\n>])\s*(?:set-cookie|cookie)\s*:\s*[^<\r\n]{8,}/i,
    /\bbearer\s+[a-z0-9._~+/=-]{16,}/i,
    /\beyJ[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\b/i,
    /\b(?:access[_-]?token|refresh[_-]?token|session[_-]?token|id[_-]?token|authenticity[_-]?token|csrf(?:[_-]?token)?|password|mfa(?:[_-]?code)?|otp)\b\s*["']?\s*(?:=|:)\s*["']?[a-z0-9._~+/=-]{8,}/i,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
  ];
  const SAFE_EXACT_ATTRIBUTES = new Set([
    "alt",
    "checked",
    "class",
    "datetime",
    "disabled",
    "hidden",
    "id",
    "name",
    "open",
    "role",
    "selected",
    "tabindex",
    "title",
    "type"
  ]);
  const SAFE_DATA_VALUE_ATTRIBUTES = new Set(CONFIG.safeDataValueAttributes || []);
  const BLOCKED_ATTRIBUTES = new Set([
    "action",
    "content",
    "crossorigin",
    "formaction",
    "integrity",
    "nonce",
    "src",
    "srcdoc",
    "srcset",
    "style",
    "value"
  ]);
  const REMOVED_ELEMENTS = [
    "script",
    "style",
    "link",
    "meta",
    "base",
    "iframe",
    "frame",
    "noscript",
    "object",
    "embed",
    "input",
    "textarea",
    "select",
    "option",
    "template",
    "canvas",
    "video",
    "audio",
    "source",
    "track"
  ];
  const KNOWN_PAGE_KINDS = (CONFIG.pageKinds || []).map(({ kind, pathPattern }) => ({
    kind,
    pattern: new RegExp(pathPattern, "i")
  }));
  const SNAPSHOT_REASONS = new Set(["final", "initial", "interaction", "manual", "mutation"]);
  const INTERACTION_TYPES = new Set(["change", "click"]);
  const NETWORK_KINDS = new Set(["graphql-failure", "graphql-request", "graphql-response"]);
  const NETWORK_BODY_OMISSIONS = new Set([
    "BODY_LIMIT_EXCEEDED",
    "BODY_UNAVAILABLE",
    "CDP_BODY_ERROR",
    "SESSION_BODY_LIMIT_EXCEEDED"
  ]);
  const GRAPHQL_ENDPOINT_PATHS = new Set(CONFIG.developmentNetworkCapture.graphqlEndpointPaths || []);

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasExactKeys(value, expected) {
    if (!isPlainObject(value)) {
      return false;
    }
    const actual = Object.keys(value).sort();
    const wanted = [...expected].sort();
    return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
  }

  function canonicalStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
    }
    if (isPlainObject(value)) {
      return `{${Object.keys(value).sort().map((key) =>
        `${JSON.stringify(key)}:${canonicalStringify(value[key])}`
      ).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function parseObservedUrl(rawUrl) {
    try {
      if (typeof rawUrl !== "string" || rawUrl.length > MAX_URL_CHARS) {
        return null;
      }
      const parsed = new URL(rawUrl);
      return ALLOWED_ORIGINS.has(parsed.origin) ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function classifyUrl(rawUrl) {
    const parsed = parseObservedUrl(rawUrl);
    if (!parsed) {
      return null;
    }
    const pathForPattern = parsed.pathname.length <= MAX_PATTERN_INPUT_CHARS ? parsed.pathname : null;
    const matched = pathForPattern
      ? KNOWN_PAGE_KINDS.find((candidate) => candidate.pattern.test(pathForPattern))
      : null;
    return matched ? matched.kind : "observed-domain";
  }

  function normalizePathname(pathname) {
    let redactNext = false;
    return pathname.split("/").map((segment) => {
      if (!segment) {
        return segment;
      }
      let decodedSegment = segment;
      try {
        decodedSegment = decodeURIComponent(segment);
      } catch (_error) {
        // Keep malformed percent-encoding opaque to the checks below.
      }
      const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedSegment);
      const digestLike = /^[0-9a-f]{24,}$/i.test(decodedSegment) && /[a-f]/i.test(decodedSegment);
      const jwtLike = /^[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}$/i.test(decodedSegment);
      const compactOpaque = /^[a-z0-9_]{32,}$/i.test(decodedSegment);
      const mixedBase64Url = /^[a-z0-9_-]{20,}$/i.test(decodedSegment) &&
        /[a-z]/.test(decodedSegment) && /[A-Z]/.test(decodedSegment) && /[0-9_-]/.test(decodedSegment);
      if (redactNext || uuidLike || digestLike || jwtLike || compactOpaque || mixedBase64Url) {
        redactNext = false;
        return "omitted";
      }
      if (/^(?:activate|activation|auth|authorize|confirm|confirmation|invite|login|magic|mfa|otp|password|recover|recovery|reset|session|share|signin|token|verify|verification)$/i.test(decodedSegment)) {
        redactNext = true;
      }
      return segment;
    }).join("/");
  }

  function normalizeObservedUrl(rawUrl) {
    const parsed = parseObservedUrl(rawUrl);
    if (!parsed) {
      return null;
    }
    const normalized = new URL(normalizePathname(parsed.pathname), parsed.origin);
    for (const [key, value] of parsed.searchParams.entries()) {
      const compactKey = key.replace(/[^a-z0-9]/gi, "");
      if (!/^[a-z0-9_.-]{1,80}$/i.test(key) || key === "_gl" || SENSITIVE_NAME.test(key) ||
          SENSITIVE_COMPACT_NAME.test(compactKey)) {
        continue;
      }
      const safeValuePattern = SAFE_QUERY_VALUE_PATTERNS.get(key);
      normalized.searchParams.append(
        key,
        safeValuePattern && value.length <= MAX_QUERY_VALUE_CHARS && safeValuePattern.test(value) ? value : ""
      );
    }
    return normalized.toString();
  }

  function normalizeObservedHref(rawHref, baseUrl) {
    if (!rawHref || String(rawHref).length > MAX_URL_CHARS) {
      return null;
    }
    try {
      const base = parseObservedUrl(baseUrl);
      const destination = parseObservedUrl(new URL(rawHref, baseUrl).toString());
      if (!base || !destination || base.origin !== destination.origin) {
        return null;
      }
      return normalizeObservedUrl(destination.toString());
    } catch (_error) {
      return null;
    }
  }

  function containsCredentialLikeValue(value) {
    const text = String(value || "").slice(0, MAX_RAW_TEXT_CHARS);
    return CREDENTIAL_LIKE_PATTERNS.some((pattern) => pattern.test(text));
  }

  function sanitizeText(value, maximumLength = MAX_TARGET_TEXT) {
    const normalized = String(value || "").slice(0, MAX_RAW_TEXT_CHARS).replace(/\s+/g, " ").trim();
    if (!normalized || containsCredentialLikeValue(normalized)) {
      return "";
    }
    return normalized.slice(0, maximumLength);
  }

  function isAllowedAttributeName(rawName) {
    const name = String(rawName || "").toLowerCase();
    const compactName = name.replace(/[^a-z0-9]/g, "");
    const sensitiveCompactName = name.startsWith("data-") ? compactName.replace(/^data/, "") : compactName;
    if (!name || name.startsWith("on") || BLOCKED_ATTRIBUTES.has(name) ||
        SENSITIVE_NAME.test(name) || SENSITIVE_COMPACT_NAME.test(sensitiveCompactName)) {
      return false;
    }
    return SAFE_EXACT_ATTRIBUTES.has(name) || name.startsWith("aria-") || name.startsWith("data-");
  }

  function sanitizeAttributeValue(name, value, baseUrl) {
    const lower = String(name || "").toLowerCase();
    if (lower === "href") {
      return normalizeObservedHref(value, baseUrl);
    }
    const boundedValue = String(value || "").slice(0, MAX_RAW_ATTRIBUTE_CHARS);
    if (!isAllowedAttributeName(lower) || containsCredentialLikeValue(boundedValue)) {
      return null;
    }
    if (lower.startsWith("data-") && !SAFE_DATA_VALUE_ATTRIBUTES.has(lower)) {
      return "";
    }
    return boundedValue.slice(0, MAX_ATTRIBUTE_VALUE);
  }

  function validateIsoTimestamp(value) {
    if (typeof value !== "string") {
      return false;
    }
    const parsed = new Date(value);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
  }

  function validateViewport(value) {
    if (!hasExactKeys(value, [
      "devicePixelRatio",
      "documentHeight",
      "documentWidth",
      "innerHeight",
      "innerWidth",
      "scrollX",
      "scrollY"
    ])) {
      return false;
    }
    for (const name of ["documentHeight", "documentWidth", "innerHeight", "innerWidth", "scrollX", "scrollY"]) {
      if (!Number.isInteger(value[name]) || value[name] < 0 || value[name] > 100000000) {
        return false;
      }
    }
    return Number.isFinite(value.devicePixelRatio) && value.devicePixelRatio > 0 && value.devicePixelRatio <= 16;
  }

  function validateTarget(value) {
    if (!hasExactKeys(value, ["ariaLabel", "classNames", "dataAttributes", "href", "id", "role", "tag", "text"])) {
      return false;
    }
    if (typeof value.tag !== "string" || !/^[a-z][a-z0-9-]{0,40}$/.test(value.tag)) {
      return false;
    }
    for (const name of ["ariaLabel", "id", "role", "text"]) {
      if (value[name] !== null && (typeof value[name] !== "string" || value[name].length > MAX_TARGET_TEXT || containsCredentialLikeValue(value[name]))) {
        return false;
      }
    }
    if (value.href !== null && normalizeObservedUrl(value.href) !== value.href) {
      return false;
    }
    if (!Array.isArray(value.classNames) || value.classNames.length > 16 || value.classNames.some(
      (name) => typeof name !== "string" || name.length > 120 || containsCredentialLikeValue(name)
    )) {
      return false;
    }
    if (!isPlainObject(value.dataAttributes) || Object.keys(value.dataAttributes).length > MAX_DATA_ATTRIBUTES) {
      return false;
    }
    return Object.entries(value.dataAttributes).every(([name, attributeValue]) =>
      name.startsWith("data-") &&
      isAllowedAttributeName(name) &&
      typeof attributeValue === "string" &&
      attributeValue.length <= MAX_ATTRIBUTE_VALUE &&
      !containsCredentialLikeValue(attributeValue)
    );
  }

  function validateRedactions(value) {
    if (!hasExactKeys(value, [
      "normalizedLinks",
      "removedAttributes",
      "removedComments",
      "removedContentEditable",
      "removedCredentialTextNodes",
      "removedElements"
    ])) {
      return false;
    }
    return Object.values(value).every((count) => Number.isInteger(count) && count >= 0 && count <= 10000000);
  }

  function validateDocumentState(value) {
    return hasExactKeys(value, ["mutationQuietMs", "readyState"]) &&
      ["complete", "interactive", "loading"].includes(value.readyState) &&
      Number.isInteger(value.mutationQuietMs) &&
      value.mutationQuietMs >= 0 &&
      value.mutationQuietMs <= 60000;
  }

  function utf8ByteLength(value) {
    return new TextEncoder().encode(value).byteLength;
  }

  function validNetworkUrl(rawUrl) {
    try {
      if (typeof rawUrl !== "string" || rawUrl.length === 0 || rawUrl.length > MAX_URL_CHARS) {
        return false;
      }
      const parsed = new URL(rawUrl);
      return ALLOWED_ORIGINS.has(parsed.origin) && !parsed.hash && GRAPHQL_ENDPOINT_PATHS.has(parsed.pathname);
    } catch (_error) {
      return false;
    }
  }

  function validateNetworkHeaders(value) {
    if (!isPlainObject(value) || Object.keys(value).length > MAX_NETWORK_HEADERS) {
      return false;
    }
    let bytes = 0;
    for (const [name, headerValue] of Object.entries(value)) {
      if (typeof name !== "string" || name.length === 0 || name.length > 256 || /[\r\n]/.test(name) ||
          ["cookie", "set-cookie"].includes(name.toLowerCase()) || typeof headerValue !== "string" ||
          headerValue.length > MAX_NETWORK_HEADERS_BYTES || /[\r\n]/.test(name)) {
        return false;
      }
      bytes += utf8ByteLength(name) + utf8ByteLength(headerValue);
      if (bytes > MAX_NETWORK_HEADERS_BYTES) {
        return false;
      }
    }
    return true;
  }

  function validateBoundedJson(value, maximumBytes = MAX_NETWORK_METADATA_BYTES) {
    try {
      const serialized = JSON.stringify(value);
      return typeof serialized === "string" && utf8ByteLength(serialized) <= maximumBytes;
    } catch (_error) {
      return false;
    }
  }

  function validateNetworkBody(value, maximumBytes) {
    if (!hasExactKeys(value, [
      "base64Encoded",
      "body",
      "byteLength",
      "complete",
      "omissionReason",
      "sha256"
    ]) || typeof value.base64Encoded !== "boolean" || typeof value.complete !== "boolean" ||
        !Number.isInteger(value.byteLength) || value.byteLength < 0 || value.byteLength > 2147483647) {
      return false;
    }
    if (value.complete) {
      return typeof value.body === "string" &&
        utf8ByteLength(value.body) === value.byteLength &&
        value.byteLength <= maximumBytes &&
        value.omissionReason === null &&
        typeof value.sha256 === "string" && /^[a-f0-9]{64}$/.test(value.sha256);
    }
    return value.body === null && value.sha256 === null && NETWORK_BODY_OMISSIONS.has(value.omissionReason);
  }

  function validateNetworkEvidence(value) {
    if (!isPlainObject(value) || value.schemaVersion !== PROTOCOL_VERSION ||
        value.contractVersion !== CONTRACT_VERSION || value.sourceTrust !== NETWORK_SOURCE_TRUST ||
        !NETWORK_KINDS.has(value.kind) || !validateIsoTimestamp(value.observedAt) ||
        typeof value.requestId !== "string" || value.requestId.length === 0 || value.requestId.length > 256 ||
        !Number.isInteger(value.tabId) || value.tabId < 0 || !validNetworkUrl(value.url) ||
        typeof value.endpoint !== "string" || value.endpoint.length > MAX_URL_CHARS) {
      return false;
    }
    const parsed = new URL(value.url);
    if (`${parsed.origin}${parsed.pathname}` !== value.endpoint) {
      return false;
    }
    if (value.kind === "graphql-request") {
      return hasExactKeys(value, [
        "body",
        "contractVersion",
        "endpoint",
        "headers",
        "kind",
        "method",
        "observedAt",
        "operationNames",
        "requestId",
        "resourceType",
        "schemaVersion",
        "sourceTrust",
        "tabId",
        "url"
      ]) && typeof value.method === "string" && /^[A-Z]{1,20}$/.test(value.method) &&
        typeof value.resourceType === "string" && value.resourceType.length <= 100 &&
        Array.isArray(value.operationNames) && value.operationNames.length <= 64 &&
        value.operationNames.every((name) => name === null || (typeof name === "string" && /^[_A-Za-z][_0-9A-Za-z]{0,255}$/.test(name))) &&
        validateNetworkHeaders(value.headers) &&
        validateNetworkBody(value.body, MAX_NETWORK_REQUEST_BODY_BYTES);
    }
    if (value.kind === "graphql-response") {
      return hasExactKeys(value, [
        "body",
        "contractVersion",
        "encodedDataLength",
        "endpoint",
        "fromDiskCache",
        "fromServiceWorker",
        "headers",
        "kind",
        "mimeType",
        "observedAt",
        "protocol",
        "requestId",
        "schemaVersion",
        "sourceTrust",
        "status",
        "statusText",
        "tabId",
        "timing",
        "url"
      ]) && Number.isInteger(value.status) && value.status >= 0 && value.status <= 999 &&
        typeof value.statusText === "string" && value.statusText.length <= 1024 &&
        typeof value.mimeType === "string" && value.mimeType.length <= 1024 &&
        typeof value.protocol === "string" && value.protocol.length <= 100 &&
        typeof value.fromDiskCache === "boolean" && typeof value.fromServiceWorker === "boolean" &&
        Number.isFinite(value.encodedDataLength) && value.encodedDataLength >= 0 && value.encodedDataLength <= Number.MAX_SAFE_INTEGER &&
        validateNetworkHeaders(value.headers) && validateBoundedJson(value.timing) &&
        validateNetworkBody(value.body, MAX_NETWORK_RESPONSE_BODY_BYTES);
    }
    return hasExactKeys(value, [
      "blockedReason",
      "canceled",
      "contractVersion",
      "endpoint",
      "errorText",
      "kind",
      "observedAt",
      "requestId",
      "schemaVersion",
      "sourceTrust",
      "tabId",
      "url"
    ]) && typeof value.errorText === "string" && value.errorText.length <= 4096 &&
      typeof value.canceled === "boolean" &&
      (value.blockedReason === null || (typeof value.blockedReason === "string" && value.blockedReason.length <= 256));
  }

  function validateObservation(value) {
    if (!isPlainObject(value) ||
        value.schemaVersion !== PROTOCOL_VERSION ||
        value.contractVersion !== CONTRACT_VERSION ||
        value.sourceTrust !== SOURCE_TRUST ||
        !validateIsoTimestamp(value.observedAt)) {
      return false;
    }
    if (classifyUrl(value.url) !== value.pageKind || normalizeObservedUrl(value.url) !== value.url || !validateViewport(value.viewport)) {
      return false;
    }
    if (value.kind === "snapshot") {
      if (!hasExactKeys(value, [
        "byteLength",
        "contractVersion",
        "documentState",
        "kind",
        "observationId",
        "observedAt",
        "pageKind",
        "redactions",
        "reason",
        "sanitizedHtml",
        "schemaVersion",
        "sha256",
        "sourceTrust",
        "title",
        "truncated",
        "url",
        "viewport"
      ])) {
        return false;
      }
      if (!SNAPSHOT_REASONS.has(value.reason) || typeof value.title !== "string" || value.title.length > 300 || containsCredentialLikeValue(value.title)) {
        return false;
      }
      if (typeof value.observationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.observationId)) {
        return false;
      }
      if (!validateRedactions(value.redactions) || !validateDocumentState(value.documentState)) {
        return false;
      }
      if (typeof value.sanitizedHtml !== "string" || !value.sanitizedHtml || containsCredentialLikeValue(value.sanitizedHtml)) {
        return false;
      }
      const byteLength = new TextEncoder().encode(value.sanitizedHtml).byteLength;
      return Number.isInteger(value.byteLength) &&
        value.byteLength === byteLength &&
        byteLength <= MAX_CAPTURE_BYTES &&
        typeof value.truncated === "boolean" &&
        typeof value.sha256 === "string" &&
        /^[a-f0-9]{64}$/.test(value.sha256);
    }
    if (value.kind === "interaction") {
      return hasExactKeys(value, [
        "interactionType",
        "kind",
        "observationId",
        "observedAt",
        "pageKind",
        "contractVersion",
        "schemaVersion",
        "sourceTrust",
        "target",
        "url",
        "viewport"
      ]) &&
        typeof value.observationId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.observationId) &&
        INTERACTION_TYPES.has(value.interactionType) &&
        validateTarget(value.target);
    }
    return false;
  }

  const policy = Object.freeze({
    PROTOCOL_VERSION,
    CONTRACT_VERSION,
    SOURCE_TRUST,
    NETWORK_SOURCE_TRUST,
    CONFIG,
    ALLOWED_ORIGINS,
    MAX_CAPTURE_BYTES,
    MAX_REQUEST_BYTES,
    MAX_NETWORK_REQUEST_BODY_BYTES,
    MAX_NETWORK_RESPONSE_BODY_BYTES,
    MAX_NETWORK_SESSION_BODY_BYTES,
    MAX_NETWORK_HEADERS,
    MAX_NETWORK_HEADERS_BYTES,
    MAX_NETWORK_METADATA_BYTES,
    MAX_CAPTURE_NODES,
    MAX_CAPTURE_DEPTH,
    MAX_ELEMENT_ATTRIBUTES,
    MAX_URL_CHARS,
    MAX_PATTERN_INPUT_CHARS,
    MAX_QUERY_VALUE_CHARS,
    MAX_RAW_TEXT_CHARS,
    MAX_RAW_ATTRIBUTE_CHARS,
    MUTATION_DEBOUNCE_MS,
    INTERACTION_SNAPSHOT_DELAY_MS,
    MAX_DATA_ATTRIBUTES,
    REMOVED_ELEMENTS,
    classifyUrl,
    canonicalStringify,
    parseObservedUrl,
    normalizeObservedHref,
    normalizeObservedUrl,
    containsCredentialLikeValue,
    sanitizeText,
    isAllowedAttributeName,
    sanitizeAttributeValue,
    validateObservation,
    validateNetworkEvidence,
    validateNetworkHeaders,
    validNetworkUrl,
    validateViewport,
    validateTarget
  });

  root.ModelLiveObserverPolicy = policy;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = policy;
  }
})(globalThis);
