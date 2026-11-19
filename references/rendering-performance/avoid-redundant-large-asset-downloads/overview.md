```yaml
---
name: avoid-redundant-large-asset-downloads
draft: blocked
draft-reason: "Cross-Origin Storage isn't shipped, in an origin trial, or TAG-reviewed (#1598)"
description: Avoid re-downloading and re-storing large shared assets, such as AI models, Wasm modules, or fully-bundled JavaScript libraries, that a visitor's browser may already hold from an unrelated site.
web-feature-ids:
  - tmp-cross-origin-storage
  - fetch
  - web-cryptography
  - permissions-policy
---
```

# Avoid redundant large asset downloads

Large shared assets such as AI model weights, Wasm modules, game engine cores, or fully-bundled JavaScript libraries are often identical across many unrelated sites. Without a shared cache, each origin downloads and stores its own copy, even when the visitor's browser already holds the exact same bytes from a different site. The Cross-Origin Storage (COS) API, exposed via `navigator.crossOriginStorage`, lets origins store and retrieve such files by content hash instead of by URL, so one on-device copy can serve every site that needs it.

## How to implement

1. **Compute the asset's hash when you build or publish your site.** Hash the exact bytes of the large asset you serve (for example, a model file, a Wasm binary, or a third-party library such as three.js) with `crypto.subtle.digest()`, and include the result as a lowercase hex string in your built code. The hash is what identifies the file in COS, and computing it on page load would require downloading the file first.
2. **Feature-detect before use, then fall back immediately if it's absent.** Check `navigator.crossOriginStorage?.getFileHandle` once up front. If COS isn't implemented in this browser, skip straight to a normal network fetch.
3. **Once support is confirmed, still call every method defensively.** Wrap each COS call in `try`/`catch`, as described in the "Handle rejections" section.
4. **Check COS before fetching from the network.** Call `getFileHandle(hash)` first. If it resolves, read the file with `handle.getFile()` and skip the network entirely.
5. **Fall back to the network on any rejection.** A `NotFoundError` is a cache miss that never proves the file is absent.
6. **Store what you fetch.** After a network fetch, request a writable handle with `{ create: true }`, write the complete file, and close the stream, so the next origin that asks for the same hash can skip the download.
7. **Choose the `origins` scope deliberately.** Pick it from the resource's real distribution, as described in the "Sharing scope" section.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/avoid-redundant-large-asset-downloads/guide.md#L1-L26). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
