"use strict";

module.exports = Object.freeze({
  schemaVersion: 3,
  bridgePort: 43116,
  displayName: "Observer Test Fixture",
  allowedOrigins: Object.freeze(["https://example.com", "https://second.example"]),
  pageKinds: Object.freeze([
    Object.freeze({ kind: "example-site", pathPattern: "^/.*$" })
  ]),
  safeQueryValuePatterns: Object.freeze({}),
  safeDataValueAttributes: Object.freeze([
    "data-action",
    "data-id",
    "data-page",
    "data-type"
  ]),
  developmentNetworkCapture: Object.freeze({
    enabled: true,
    graphqlEndpointPaths: Object.freeze(["/graphql"]),
    maximumPendingRequests: 64,
    maximumRequestBodyBytes: 16 * 1024 * 1024,
    maximumResponseBodyBytes: 64 * 1024 * 1024,
    maximumSessionBodyBytes: 512 * 1024 * 1024
  })
});
