(function initializeModelLiveObserverConfig(root) {
  "use strict";

  const config = Object.freeze({
    schemaVersion: 3,
    bridgePort: 43116,
    displayName: "Live Research Observer",
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
      maximumRequestBodyBytes: 16777216,
      maximumResponseBodyBytes: 67108864,
      maximumSessionBodyBytes: 536870912
    })
  });

  root.ModelLiveObserverConfig = config;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
})(globalThis);
