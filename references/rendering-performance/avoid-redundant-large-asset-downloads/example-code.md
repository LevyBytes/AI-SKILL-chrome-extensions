## Example code

At build time, compute the hash once and inline it into your code:

```javascript
// build-hash.js (Node.js)
import { readFile } from 'node:fs/promises';

const bytes = await readFile('dist/assets/shared-library.js');
const digest = await crypto.subtle.digest('SHA-256', bytes);
const hex = Array.from(new Uint8Array(digest), (byte) =>
  byte.toString(16).padStart(2, '0'),
).join('');
```

At runtime, load every large shared asset through one reusable helper that looks the file up by that hash:

```javascript
/**
 * Loads a large shared asset from COS when available, otherwise from the
 * network, and stores network responses in COS for the next origin.
 * @param {string} url The asset's real, working network URL.
 * @param {{algorithm: string, value: string}} hash The build-time hash.
 * @param {'*' | string[]} [origins] Sharing scope; omit for same-site only.
 * @returns {Promise<Blob>}
 */
async function loadAsset(url, hash, origins) {
  // Feature-detect once, up front, and fall back to the network
  // immediately if COS isn't implemented in this browser.
  const supportsCOS = !!navigator.crossOriginStorage?.getFileHandle;
  // Set when Permissions Policy blocks COS in this context, since every
  // further COS call here rejects the same way.
  let blocked = false;

  if (supportsCOS) {
    try {
      // Check COS first. If another origin already stored this exact
      // hash, this resolves with no network request at all.
      const handle = await navigator.crossOriginStorage.getFileHandle(hash);
      return await handle.getFile();
    } catch (err) {
      // A NotFoundError does not prove the file is absent from COS. Fall
      // back to the network either way; never treat it as fatal.
      blocked = err.name === 'NotAllowedError';
    }
  }

  const response = await fetch(url);
  const fileBlob = await response.blob();

  if (supportsCOS && !blocked) {
    // Write back to the cache.
    try {
      const handle = await navigator.crossOriginStorage.getFileHandle(hash, {
        create: true,
        // Only pass `origins` when the caller chose a scope, so omitting it
        // keeps the same-site-only default.
        ...(origins && { origins }),
      });
      const writable = await handle.createWritable();
      await writable.write(fileBlob);
      await writable.close();
      // Never call getFile() on this handle before write()/close() has
      // resolved; use the blob already in hand instead.
    } catch {
      // Storing is a nice-to-have for future visitors, not required for
      // this page to work.
    }
  }

  return fileBlob;
}

const library = await loadAsset(
  '/assets/shared-library.js',
  {
    algorithm: 'SHA-256',
    // Example-only hash value; use the hex string from your build step.
    value: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  },
  // MANDATORY: origins: '*' is only appropriate for genuinely popular,
  // non-proprietary resources.
  '*',
);
```

## Handle rejections

A browser that implements COS can still reject any call, so a passed feature-detection check never guarantees success. Fall back to the network on every rejection, and read the error name to decide what else to do:

- **`NotFoundError` from `getFileHandle(hash)`:** an ordinary cache miss that never proves the file is absent. The file may not exist, your origin may be outside its sharing scope, a globally shared file may not be on the browser's list of popular hashes yet, or the browser may deliberately report a stored file as missing to protect privacy (GREASE'ing). Store the file after the network fetch as usual.
- **`NotAllowedError` from `getFileHandle()`:** Permissions Policy blocks COS in this context, for example in a cross-origin iframe whose embedder didn't grant the `cross-origin-storage` feature (its default allowlist is `self`). Every further COS call in this context rejects the same way, so skip the write-back too.
- **`NotAllowedError` from `getFile()`:** you called it on a handle obtained with `{ create: true }` before your own write completed, which applies even when another origin already stored the file. Use the blob you already have.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/performance/avoid-redundant-large-asset-downloads/guide.md#L27-L120). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
