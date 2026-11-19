#### Clone sessions for repetitive tasks

*Applies to: Prompt API.*

For the Prompt API, each session [tracks the context of the
conversation](https://developer.chrome.com/docs/ai/prompt-api?content_ref=each+session+keeps+track+of+the+context+of+the+conversation+previous+interactions+are+taken+into+account+for+future+interactions+until+the+session+s+context+window+is+full),
taking all previous interactions into account. Because a clone inherits
everything from its parent session, including initial prompts and all
interaction history up to the point of cloning, structure your usage to inherit
only what you need.

**Do:**

- Create a base session: To handle unrelated tasks efficiently, create a base session that contains only your system instructions and no previous conversational context.
- Clone the baseline: Use `clone()` on that base session for new tasks to save the overhead of re-parsing system instructions. This lets you create parallel conversations or reset a task to its baseline.

**Don't:**

- Don't reuse the same session for unrelated tasks, and avoid cloning any session that already contains unnecessary interaction history. Both patterns can cause unrelated previous context to interfere with your current task.
- Don't repeatedly call `create()` with identical system instructions. Use the cloning pattern instead to optimize performance.

#### Destroy unused sessions

*Applies to: All APIs.*

**Do:** Explicitly call [`destroy()`](https://developer.chrome.com/docs/ai/prompt-api#terminate_a_session) on
sessions that you no longer need, to free up memory when a feature
is no longer in use. If you use a cloning pattern, keep the base session while
you still need to create new clones, destroy each cloned session as soon as its
task finishes, and destroy the base session once no further clones are needed.

**Don't:** Keep multiple large sessions active. Each session consumes memory,
which creates unnecessary resource usage and might become a problem. Sessions
will be naturally cleaned up by the garbage collector, but calling `destroy()`
frees up memory more quickly.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-model/guide.md#L239-L330). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
