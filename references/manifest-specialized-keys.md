# Manifest Specialized Keys

> Manifest V3 API examples are fragments: run awaited calls inside an async handler and supply the shown input variables. Register worker listeners synchronously at startup; each API heading links to its official contract.

## Overview
Niche `manifest.json` keys for narrow cases: ChromeOS integration, text-to-speech engines, cross-origin isolation, shared code, origin trials, hardware requirements, and DevTools panels. Most are rarely needed; several are ChromeOS-only.

## `file_browser_handlers`
Register handlers the ChromeOS Files app can invoke on selected files (via the `fileBrowserHandler` API). Array of objects with `id`, `default_title`, and `file_filters` (patterns prefixed `filesystem:`). Requires the `fileBrowserHandler` permission. ChromeOS only.

```json
{
  "file_browser_handlers": [{ "id": "upload", "default_title": "Save to Gallery", "file_filters": ["filesystem:*.jpg", "filesystem:*.png"] }]
}
```

## `file_handlers`
Declare which file types a ChromeOS extension can open (Chrome 120+). Array of objects: `action` (HTML path), `name`, `accept` (MIME type to extension array), `launch_type` (`"single-client"` or `"multiple-clients"`). ChromeOS only.

```json
{
  "file_handlers": [{ "action": "/open_text.html", "name": "Plain text", "accept": { "text/plain": [".txt"] } }]
}
```

## `file_system_provider_capabilities`
Describe a virtual file system provided via the `fileSystemProvider` API. Object with `configurable`, `watchable`, `multiple_mounts` (booleans), and `source` (`"file"`/`"device"`/`"network"`, required). Requires the `fileSystemProvider` permission. ChromeOS only.

```json
{
  "file_system_provider_capabilities": { "configurable": true, "watchable": false, "multiple_mounts": true, "source": "network" }
}
```

## `input_components`
Register an input method editor (IME) using the `input.ime` API. Array of objects: `name` (required), plus `id`, `language`, `layouts`, `input_view`, `options_page`. Requires the `input` permission. ChromeOS only.

```json
{
  "input_components": [{ "name": "ToUpperIME", "id": "ToUpperIME", "language": "en", "layouts": ["us::eng"] }]
}
```

## `tts_engine`
Declare the voices a TTS engine extension provides (paired with the `ttsEngine` API/permission). Object with a `voices` array; each voice has `voice_name` (required), `lang`, and `event_types` (e.g. `"start"`, `"end"`, `"marker"`).

```json
{
  "tts_engine": { "voices": [{ "voice_name": "Alice", "lang": "en-US", "event_types": ["start", "marker", "end"] }] }
}
```

Open when declaring isolation, shared modules, origin trials, requirements or DevTools entrypoints. [Manifest Isolation and Shared Modules](manifest-isolation-shared-modules.md).

