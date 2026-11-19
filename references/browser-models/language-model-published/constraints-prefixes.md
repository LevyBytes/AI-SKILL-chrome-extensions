### Constraints and Prefixes

You can guide the model further by prefilling the assistant's response using `prefix: true`.

````javascript
const character = await session.prompt([
	{ role: 'user', content: 'Create a character sheet' },
	{ role: 'assistant', content: '```json\n', prefix: true },
]);
````

## 5. Best Practices and Safety

- **Resource Cleanup**: Always call `session.destroy()` when a conversation is finished to free up memory.
- **Output Safety**: Model output is untrusted. Always write results to `textContent`, not `innerHTML`, to prevent XSS injection from malicious model output.
- Use a sanitizer like the native Sanitizer API or DOMPurify if you need to allow limited HTML.
- **Aborting Tasks**: Use `AbortController` to allow users to stop long-running generations. Pass the `signal` to `prompt()` or `promptStreaming()`, not to `LanguageModel.create()`. If the stop button is hidden while it has focus, move focus to the control that started the generation (WCAG 2.4.3 Focus Order).
- **Error Handling**: `create()`, `prompt()`, `promptStreaming()` and `JSON.parse()` can all fail, so wrap them, and the loop that reads a stream, in `try`/`catch`, and show a plain-language error in the output's live region (WCAG 3.3.1 Error Identification). Treat the `AbortError` from a user's stop as expected, not as an error.
- **Security**: Use Permission Policies to control access in iframes: `<iframe src="..." allow="language-model"></iframe>`.
- **Design**: Review the [People + AI Guidebook](https://pair.withgoogle.com/guidebook/) to ensure responsible AI implementation.

By combining structured outputs with robust session management, developers can build complex, stateful AI applications that run entirely on the user's device.

### Dos and Don'ts

For the full detailed list of dos and don'ts, see https://developer.chrome.com/docs/ai/built-in-ai-dos-donts.md.txt. Below is the gist:

#### Prepare the model at a reasonable time

*Applies to: all APIs, for example, Summarizer, Translator, and Writer.*

**Do:** Initialize the session as soon as you've clearly established the user's intention to use the AI feature, for example, when a user navigates into a relevant AI tools surface, hovers over an AI workspace, or interacts with the feature's surrounding UI. Pre-warming the session allows the model to load into memory quietly in the background while the user is setting up their task, eliminating avoidable cold-start latency.
Try to be one step ahead by starting the next most likely AI task as soon as you start rendering the current result, for example, if the feature is designed for iterative use.

**Don't:** Unless necessary, don't wait for the user to click "Generate" to initialize the session. This leads to a cold start delay, because the model must first load into memory and prepare its execution pipeline.

> [!CAUTION]
> For the Prompt API, wait until you have the `initialPrompts` ready before calling `create()`, because these can only be set during session creation.

#### Set initial prompts during creation

*Applies to: Prompt API.*

**Do:** Provide system instructions during session initialization to improve the
speed of the first prompt.

**Don't:** Start with an empty session and send system instructions as part of
the first `prompt()` call. This increases latency because it forces the model to
process those instructions at the last moment.

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/language-model.md#L182-L267). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. [Alternate upstream path](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/built-in-ai/prompt-api.md). Reorganized for this edition.
