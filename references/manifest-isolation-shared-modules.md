# Manifest Isolation and Shared Modules

Open when declaring isolation, shared modules, origin trials, requirements or DevTools entrypoints.

## `cross_origin_embedder_policy`
Sets the `Cross-Origin-Embedder-Policy` (COEP) response header for the extension's origin (Chrome 93+). Object with a `value` string (e.g. `"require-corp"`).

```json
{
  "cross_origin_embedder_policy": { "value": "require-corp" }
}
```

## `cross_origin_opener_policy`
Sets the `Cross-Origin-Opener-Policy` (COOP) response header. Object with a `value` string (e.g. `"same-origin"`). Combined with COEP, opts into cross-origin isolation.

```json
{
  "cross_origin_opener_policy": { "value": "same-origin" }
}
```

## `shared_modules`
Two fields enabling resource/API sharing between extensions. `export` is an object with an `allowlist` array of extension IDs permitted to import. `import` is an array of objects, each `{ "id": "EXTENSION_ID", "minimum_version": "0.5" }` (the `minimum_version` is optional).

```json
{
  "export": { "allowlist": ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] },
  "import": [{ "id": "cccccccccccccccccccccccccccccccc" }, { "id": "dddddddddddddddddddddddddddddddd", "minimum_version": "0.5" }]
}
```

## `trial_tokens`
Enroll the extension in Origin Trial / Deprecation Trial features. An array of opaque token strings (one per trial feature).

```json
{
  "trial_tokens": ["AnlT7gRo...AAAG97Im9yaWdpbiI6..."]
}
```

## `requirements`
Declare technologies the extension needs so a host can warn unsupported users. Object keyed by requirement; `"3D"` takes a `features` array of `"webgl"` and/or `"css3d"`. (The former `"plugins"` requirement was deprecated in Chrome 45.)

```json
{
  "requirements": { "3D": { "features": ["webgl"] } }
}
```

## `event_rules` (migration context)
Declaratively register `{ event, conditions, actions }` rules. The reference page is legacy and references `declarativeWebRequest`, which is not available in MV3; the supported MV3 path is `declarativeContent` (register its rules via the `chrome.declarativeContent` API at runtime).

## `devtools_page`
Path to an HTML page that runs in the DevTools context; declaring it enables the `chrome.devtools.*` APIs.

```json
{
  "devtools_page": "devtools.html"
}
```

[Topic context](manifest-specialized-keys.md)
