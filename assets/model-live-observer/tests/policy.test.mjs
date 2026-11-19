import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
globalThis.ModelLiveObserverConfig = require("./test-observer-config.cjs");
const policy = require("../extension/observer-policy.js");

function viewport() {
  return {
    innerWidth: 1600,
    innerHeight: 900,
    scrollX: 0,
    scrollY: 100,
    documentWidth: 1600,
    documentHeight: 5000,
    devicePixelRatio: 1.25
  };
}

function redactions() {
  return {
    removedElements: 2,
    removedContentEditable: 0,
    removedComments: 1,
    removedCredentialTextNodes: 0,
    removedAttributes: 4,
    normalizedLinks: 3
  };
}

function snapshot() {
  const sanitizedHtml = "<!doctype html>\n<html><body>fixture page</body></html>";
  return {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.SOURCE_TRUST,
    kind: "snapshot",
    observationId: randomUUID(),
    observedAt: new Date().toISOString(),
    pageKind: "example-site",
    url: "https://example.com/records?page=",
    title: "Example records",
    reason: "manual",
    sanitizedHtml,
    byteLength: new TextEncoder().encode(sanitizedHtml).byteLength,
    truncated: false,
    sha256: createHash("sha256").update(sanitizedHtml, "utf8").digest("hex"),
    redactions: redactions(),
    documentState: { readyState: "complete", mutationQuietMs: 0 },
    viewport: viewport()
  };
}

test("normalizes configured routes without retaining query values by default", () => {
  const normalized = policy.normalizeObservedUrl(
    "https://example.com/records?page=2&_gl=tracking&session_token=secret&view=grid"
  );
  assert.equal(normalized, "https://example.com/records?page=&view=");
  assert.equal(policy.classifyUrl(normalized), "example-site");
  assert.equal(policy.classifyUrl("https://example.com/future"), "example-site");
  assert.equal(policy.classifyUrl("https://other.example/records"), null);
  assert.equal(policy.normalizeObservedHref("https://second.example/records", "https://example.com/records"), null);
});

test("compact sensitive query names cannot be retained by configuration", () => {
  const normalized = policy.normalizeObservedUrl(
    "https://example.com/records?accessToken=secret-value&apiKey=another-secret&ordinary=value"
  );
  assert.equal(normalized, "https://example.com/records?ordinary=");
});

test("redacts opaque path credentials while retaining ordinary slugs and numeric IDs", () => {
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/records/550e8400-e29b-41d4-a716-446655440000/details"),
    "https://example.com/records/omitted/details"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/records/0123456789abcdef0123456789abcdef"),
    "https://example.com/records/omitted"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/records/0123456789abcdef01234567"),
    "https://example.com/records/omitted"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/records/Ab3dEf6hIj9kLm2nOp5qRs"),
    "https://example.com/records/omitted"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/records/abcdefghijklmnopqrstuvwxyzabcdef"),
    "https://example.com/records/omitted"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/share/Ab3dEf6hIj9kLm2nOp5qRs8tUv1wXy4z"),
    "https://example.com/share/omitted"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/articles/release-notes-2026-11-16/123456789"),
    "https://example.com/articles/release-notes-2026-11-16/123456789"
  );
  assert.equal(
    policy.normalizeObservedUrl("https://example.com/catalog/product1234567890abcdefghi"),
    "https://example.com/catalog/product1234567890abcdefghi"
  );
});

test("attribute policy broadens discovery without retaining active or credential surfaces", () => {
  for (const allowed of ["id", "class", "role", "aria-expanded", "data-page", "open"]) {
    assert.equal(policy.isAllowedAttributeName(allowed), true, allowed);
  }
  for (const blocked of [
    "onclick",
    "src",
    "srcset",
    "style",
    "value",
    "data-session-token",
    "data-accessToken",
    "data-authToken",
    "data-csrfToken",
    "data-sessionid",
    "nonce"
  ]) {
    assert.equal(policy.isAllowedAttributeName(blocked), false, blocked);
  }
  assert.equal(
    policy.sanitizeAttributeValue("data-page", "2", "https://example.com/records"),
    "2"
  );
  assert.equal(
    policy.sanitizeAttributeValue("href", "https://other.example/?token=secret", "https://example.com/"),
    null
  );
  assert.equal(
    policy.sanitizeAttributeValue("data-future-selector", "opaque-value-that-must-not-persist", "https://example.com/"),
    ""
  );
  assert.equal(
    policy.sanitizeAttributeValue("data-value", "private form choice", "https://example.com/"),
    ""
  );
});

test("untrusted regex inputs are bounded before configured patterns run", () => {
  const longQuery = "a".repeat(policy.MAX_QUERY_VALUE_CHARS + 1);
  assert.equal(
    policy.normalizeObservedUrl(`https://example.com/records?page=${longQuery}`),
    "https://example.com/records?page="
  );
  const longPath = `https://example.com/${"a".repeat(policy.MAX_PATTERN_INPUT_CHARS + 1)}`;
  assert.equal(policy.classifyUrl(longPath), "observed-domain");
  assert.equal(policy.parseObservedUrl(`https://example.com/${"a".repeat(policy.MAX_URL_CHARS)}`), null);
});

test("credential-shaped values are rejected while ordinary account wording remains", () => {
  const fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.signature12345";
  assert.equal(policy.containsCredentialLikeValue(fakeJwt), true);
  assert.equal(policy.containsCredentialLikeValue("Authorization: Bearer fake-token-value-123456"), true);
  assert.equal(policy.containsCredentialLikeValue("Credit Buy-Back Token"), false);
  assert.equal(policy.sanitizeText(fakeJwt), "");
});

test("canonical JSON is stable and the observation contract is exact", () => {
  assert.equal(policy.canonicalStringify({ b: 2, a: { d: 4, c: 3 } }), "{\"a\":{\"c\":3,\"d\":4},\"b\":2}");
  const valid = snapshot();
  assert.equal(policy.validateObservation(valid), true);
  assert.equal(policy.validateObservation({ ...valid, rawHtml: valid.sanitizedHtml }), false);
  assert.equal(policy.validateObservation({ ...valid, sourceTrust: "trusted" }), false);
  assert.equal(policy.validateObservation({ ...valid, truncated: true }), true);
  const secret = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.signature12345";
  assert.equal(policy.validateObservation({
    ...valid,
    sanitizedHtml: `<html>${secret}</html>`,
    byteLength: new TextEncoder().encode(`<html>${secret}</html>`).byteLength,
    sha256: createHash("sha256").update(`<html>${secret}</html>`, "utf8").digest("hex")
  }), false);
});

test("trusted interaction envelopes never contain form values", () => {
  const observation = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.SOURCE_TRUST,
    kind: "interaction",
    observationId: randomUUID(),
    observedAt: new Date().toISOString(),
    pageKind: "example-site",
    url: "https://example.com/records?page=",
    interactionType: "click",
    target: {
      tag: "button",
      id: null,
      classNames: ["pager-next"],
      role: "button",
      ariaLabel: "Next page",
      text: "Next",
      href: null,
      dataAttributes: { "data-page": "2" }
    },
    viewport: viewport()
  };
  assert.equal(policy.validateObservation(observation), true);
  assert.equal(policy.validateObservation({
    ...observation,
    target: { ...observation.target, value: "secret" }
  }), false);
});

test("sensitive GraphQL request evidence is exact and cookie headers are forbidden", () => {
  const rawBody = JSON.stringify({
    query: "query Development($id: ID!) { account(id: $id) { id } }",
    variables: { id: "private-account-id" }
  });
  const request = {
    schemaVersion: policy.PROTOCOL_VERSION,
    contractVersion: policy.CONTRACT_VERSION,
    sourceTrust: policy.NETWORK_SOURCE_TRUST,
    kind: "graphql-request",
    requestId: "request-1",
    observedAt: new Date().toISOString(),
    tabId: 41,
    url: "https://example.com/graphql?source=account",
    endpoint: "https://example.com/graphql",
    method: "POST",
    resourceType: "Fetch",
    headers: { Authorization: "Bearer retained-token", "Content-Type": "application/json" },
    operationNames: ["Development"],
    body: {
      base64Encoded: false,
      body: rawBody,
      byteLength: new TextEncoder().encode(rawBody).byteLength,
      complete: true,
      omissionReason: null,
      sha256: createHash("sha256").update(rawBody, "utf8").digest("hex")
    }
  };
  assert.equal(policy.validateNetworkEvidence(request), true);
  assert.equal(policy.validateNetworkEvidence({
    ...request,
    headers: { ...request.headers, Cookie: "session=forbidden" }
  }), false);
  assert.equal(policy.validateNetworkEvidence({
    ...request,
    url: "https://example.com/not-configured"
  }), false);
  assert.equal(policy.validateNetworkEvidence({
    ...request,
    body: { ...request.body, body: null, complete: false, omissionReason: "BODY_LIMIT_EXCEEDED", sha256: null }
  }), true);
});
