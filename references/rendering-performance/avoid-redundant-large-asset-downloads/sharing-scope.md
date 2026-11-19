## Sharing scope

{{ FEATURE("tmp-cross-origin-storage", "sharing-scope") }}

## Best practices

- **DO** write the complete file with `createWritable()` / `write()` / `close()` (or `pipeTo()`) every time you store, even if the file might already exist in COS.
- **DO** use `Promise.all()` over individual `getFileHandle()` calls to look up several distinct hashes concurrently, since each call takes exactly one hash.

## Fallback strategy

{{ FEATURE("tmp-cross-origin-storage", "browser-support") }}

The COS API is a progressive enhancement over a normal network fetch. Guard every access to `navigator.crossOriginStorage` with a single up-front feature-detection check, and always keep a working network-fetch path as the fallback for browsers without COS support.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/avoid-redundant-large-asset-downloads/guide.md#L121-L134). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
