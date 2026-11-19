# Web surfaces in Chrome extensions

Choose the document that owns the interaction. An action popup can disappear between edits. An options or new-tab page can host a full application. A side panel can stay visible across tab changes. A DevTools panel acts on the inspected target. A content script shares a document with the host page. An offscreen document performs a bounded background DOM task. The extension worker coordinates state and events. [Architecture](concepts-architecture.md) · [Extension implementation examples](extension-development/index.md)

- **Action popups.** Save pending input early enough to survive a close. Restore selection, validation and focus on reopen. Test at narrow widths, enlarged text and with IME composition active. [Popup lifecycle](extension-development/popup-ui.md) · [Forms](form-controls/index.md) · [Accessible interfaces](accessible-interfaces/index.md)
- **Side panels.** Distinguish global and tab-specific panels. Bind state and requests to the intended tab. On tab change or closure discard stale replies and update the visible context. An observation bound to a particular tab stays bound to it until explicitly authorized again. [Panel messaging](extension-development/side-panel/communication-side-panel.md) · [Observer contract](live-research-observer.md) · [Responsive layout](layout-and-cascade/index.md)
- **Options, full-page views and DevTools panels.** Use accessible menus, grids, tabs, dialogs, status messages and localized input. Test keyboard ordering, long translated labels, and restoration of focus. A DevTools panel should track its inspected target. [Components](interface-components/index.md) · [DevTools](extension-development/devtools/overview.md) · [Localization](api-i18n.md)
- **Content scripts and injected controls.** Check frame and world, CSS collisions, inherited typography, keyboard focus and removal on navigation. Shadow DOM provides encapsulation. Keep privilege decisions in the extension and validate requests from page-facing code. [Content scripts](concepts-content-scripts.md) · [Document structure](document-structure/index.md) · [Messaging](concepts-messaging.md)
- **Worker, offscreen document and capture.** Keep resumable state across worker eviction. Serialize competing starts for an exclusive capture and reconcile stale state. A storage read followed by a write can race. Keep DOM-dependent work in an appropriate document and check stream cleanup. [Worker lifecycle](concepts-service-workers.md) · [Offscreen lifecycle](offscreen-document-lifecycle.md) · [Media capture](extension-development/media-capture/overview.md)
- **API requests, identity and permissions.** Check the operation, sender and authorized origin. A content script fetch uses the host page's origin rules. Choose the narrow permission for the feature. A matching host grant or applicable temporary access can expose tab metadata, so treat the captured blanket tabs-permission rule as overbroad. [Network requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests) · [Tabs contract](https://developer.chrome.com/docs/extensions/reference/api/tabs) · [Grant selection](concepts-permissions.md)
- **Local models, media, WASM and advanced APIs.** Test the actual browser, execution context, availability, consent, permissions and packaged CSP. Offer a usable fallback during download, denial or absence. Follow origin restrictions for packaged code and resources. [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) · [Extension security](concepts-security-privacy.md)
- **Verification.** Use headless browser fixtures for form, layout and focus behavior. Exercise the unpacked extension for worker suspension, popup closure, stale panel replies, offscreen transitions and permission denial. [Extension testing](howto-test-debug.md)

## Local topic references

- Open when checking accessible names, error announcements or system text scaling. [Accessible interfaces](accessible-interfaces/index.md).
- Open when adapting navigation and interaction to devices and user preferences. [Adaptive experiences](adaptive-experiences/index.md).
- Open when checking device support for prompting, translation, detection or summarization. [Built-in model APIs](browser-models/index.md).
- Open when implementing origin checks, content safety, cryptography or passkeys. [Browser security and identity](browser-security/index.md).
- Open when working with client data, timestamps, calendars or asynchronous state. [JavaScript and time](client-data/index.md).
- Open when choosing semantic elements, creating custom elements or managing a shadow tree. [HTML and web components](document-structure/index.md).
- Open when implementing Manifest V3 components, API calls or extension UI. [Chrome extension development](extension-development/index.md).
- Open when checking platform feature identifiers, trial records or fallback behavior. [Feature support and fallbacks](feature-support/index.md).
- Open when implementing validation, autofill, text entry, pickers or range controls. [Form entry and selection](form-controls/index.md).
- Open when building offline behavior, installation, updates or OS integration. [Installed web applications](installed-web-apps/index.md).
- Open when handling gestures, navigation, focus, motion or scroll behavior. [Interaction patterns](interaction-patterns/index.md).
- Open when building navigation, dialogs, menus, tables or application controls. [Interface components](interface-components/index.md).
- Open when positioning overlays or adding scroll cues, icons and overflow indicators. [Interface details](interface-details/index.md).
- Open when choosing layout, intrinsic sizing, conditional styles or responsive components. [CSS layout and the cascade](layout-and-cascade/index.md).
- Open when handling web identity, embedded state and privacy boundaries. [Browser privacy](privacy-controls/index.md).
- Open when measuring loading, rendering, interaction latency or resource priorities. [Loading and responsiveness](rendering-performance/index.md).
- Open when selecting typography, color, artwork and visual treatments. [Visual presentation](visual-presentation/index.md).
- Open when exposing a form or registering an authorized tool from a web document. [WebMCP tools](web-tools/index.md).
- Open when compiling C or C++ for a browser runtime. [WebAssembly builds](webassembly-builds/index.md).

Use Node.js 22.18 or later to search the local web guides from this skill directory. Run `node scripts/lookup.ts search "IME composing text"` and then `node scripts/lookup.ts retrieve ime-safe-enter-submit`. Use this local command where captured prose refers to the upstream search package. Select `--edition published` for expanded examples when available. Web lookup covers the local web guides. The product reference index covers the host APIs.
