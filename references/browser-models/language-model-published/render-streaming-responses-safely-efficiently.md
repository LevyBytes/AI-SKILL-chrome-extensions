#### Render streaming responses safely and efficiently

*Applies to: All APIs with streaming support (Prompt, Summarizer, Writer,
Rewriter, and Translator).*

**Do:** Treat all LLM output as untrusted content. Sanitize the full combined
output, not just chunks, because malicious code could be split across updates.
Before rendering, use the [Sanitizer
API](https://developer.mozilla.org/docs/Web/API/HTML_Sanitizer_API) where
supported. To avoid a decrease in performance, use a streaming Markdown parser
like [streaming-markdown](https://github.com/thetarnav/streaming-markdown).

**Don't:** Directly set `innerHTML` on every chunk update. This is slow,
especially with complex formatting like syntax highlighting, and vulnerable to
injection.

#### Optimize input for speed

*Applies to: All APIs.*

**Do:** Only pass to the model what's strictly needed. Strip everything that's
irrelevant to the task at hand. For large datasets, provide a short overview and
a small selection of relevant items.

**Don't:** Send raw unprocessed text, unnecessary metadata, HTML tags, or large
unfiltered lists to the APIs. Latency grows significantly with input size, which
can make the AI feature seem broken on many devices.

#### Use structured output for predictable results

*Applies to: Prompt API.*

**Do:** When you need the model to return data in a specific format, use
[structured
output](https://developer.chrome.com/docs/ai/structured-output-for-prompt-api?content_ref=he+prompt+api+lets+you+specify+a+json+output+format+of+the+model+s+response+by+passing+a+json+schema+to+the+languagemodel+prompt+and+languagemodel+promptstreaming+methods)
by providing a `responseConstraint` field to provide a JSON Schema. This ensures
the output is predictable and prevents you from needing complex post-processing
or manual parsing.

**Don't:** Rely on natural language instructions (like "output only JSON")
alone. Models might include conversational filler that breaks your parser.

#### Decouple generation from length constraints

*Applies to: Prompt API, as it's the only API that supports [structured output
schemas](https://developer.chrome.com/docs/ai/structured-output-for-prompt-api).*

**Do:** Let the model generate its response naturally, and then use client-side
logic to truncate the text to fit your UI.

**Don't:** Enforce strict character limits like `maxLength: 125` using
[structured output schemas](https://developer.chrome.com/docs/ai/structured-output-for-prompt-api). When a
model's response is longer than the limit you set, the model might switch to
high-density tokens like foreign languages or emoji to compress meaning,
resulting in nonsensical output.

#### Keep the user informed

*Applies to: All APIs.*

**Do:** Depending on the complexity and expected duration of the task, use animations, visual cues, and progress indicators to keep the user informed. The
optimal approach depends on your use case and the expected length of the API
output. Some ideas:

- Streaming for long content: For summaries or chat, streaming creates a per-token typewriter effect by default. This can feel natural and provide immediate feedback.
- Non-streaming for short tasks (or long async tasks): For short outputs, for example, alt-text, non-streaming can create a more polished UI. It also provides time to speculatively prepare the next AI task while the current one renders. This approach also works for longer asynchronous or background tasks. If the user is not blocked on the output to continue their journey, there is no urgent need to produce the output as it happens. Signal that the process is ongoing in the UI.
- Visual transitions for updates: When translating or rewriting text, use animations, for example, word-morphing. For respecting reduced-motion preferences, see `motion` (via `npx -y modern-web-guidance@latest retrieve "motion"`).

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/language-model.md#L268-L359). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. [Alternate upstream path](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/prompt-api.md). Reorganized for this edition.
