#### Keep the user informed

*Applies to: All APIs.*

**Do:** Depending on the complexity and expected duration of the task, use animations, visual cues, and progress indicators to keep the user informed. The
optimal approach depends on your use case and the expected length of the API
output. Some ideas:

- Streaming for long content: For summaries or chat, streaming creates a per-token typewriter effect by default. This can feel natural and provide immediate feedback.
- Non-streaming for short tasks (or long async tasks): For short outputs, for example, alt-text, non-streaming can create a more polished UI. It also provides time to speculatively prepare the next AI task while the current one renders. This approach also works for longer asynchronous or background tasks. If the user is not blocked on the output to continue their journey, there is no urgent need to produce the output as it happens. Signal that the process is ongoing in the UI.
- Visual transitions for updates: When translating or rewriting text, use animations, for example, word-morphing. For respecting reduced-motion preferences, see {{ GUIDE_REF("motion") }}.

**Don't:** Update the UI without visual cues, or without announcing the update to assistive technology users.

#### Align with the user's mental model of time and work

*Applies to: All APIs.*

**Do:** Consider an artificial delay of one or two seconds if a response is
nearly instant. Paradoxically, users might find results more trustworthy when
they perceive a generation process that aligns with their perceived difficulty
of the task. Use animations to signal that an AI process has occurred.

**Don't:** Surprise users with instant UI replacements.

#### Allow users to quickly navigate and undo AI edits

*Applies to: All APIs.*

**Do:** Equip your UI with a stepper or navigation history that lets users
explore different results confidently, and let them quickly undo AI edits. This
ensures that different versions are still readily available.

**Don't:** Overwrite the user's previous draft, or an AI result they might have
liked without a way to go back, revert, or compare versions.

#### Empower user control and overrides

*Applies to: All APIs.*

**Do:** Make the user the final editor of all generated content. Provide intuitive overrides so the user maintains full ownership for the final output. The APIs may produce incorrect results.

**Don't:** Force an AI-generated result as the only option.

#### Cache results for repeated tasks

*Applies to: All APIs.*

**Do:** Implement a local result cache (for example, using `sessionStorage` or
`IndexedDB`) for repeated inputs or queries. Normalize the input by trimming
whitespace and lowercasing to increase cache hits. For heavy inputs, for
example, images, generate a hash to use as a cache key. Set a conservative
time to live (TTL) for your cache (or serve cached results while updating them
in the background). Let the user trigger a fresh inference if the result is
unsatisfying.

**Don't:** Re-run the same inference for a repeated search query or identical data input where variability isn't desirable, for example when a user navigates back and forth between search results.
This optimizes responsiveness and efficient use of local compute.

## 6. Fallback strategies

{{ BASELINE_STATUS("languagemodel") }}

Before use, check if the LanguageModel object is available in the global scope:

```js
if ('LanguageModel' in self) {
  // The Prompt API is supported.
} else {
  // Execute fallback strategy
}
```

If the Prompt API is unsupported or availability checks return 'unavailable', you must gracefully fall back:

* Remote API Fallback: Redirect the detection request to a server endpoint or a cloud API (such as the Vertex AI Gemini API).
* Local API Fallback: Redirect the detection request to a local endpoint, for example, using Transformers.js. 

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-model/guide.md#L331-L407). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
