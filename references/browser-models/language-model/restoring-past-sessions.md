### Restoring Past Sessions

While a native "restore" feature is in development, you can recreate a session by feeding previous history into `initialPrompts`.

**Note**: `localStorage` is unencrypted and persistent. Stored conversation history may include user PII — consider the privacy implications before persisting chat history.

```javascript
// || '[]' ensures JSON.parse never receives null when the key doesn't exist yet.
const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
const session = await LanguageModel.create({
	initialPrompts: history, // Array of {role, content} objects
});
```

## 4. Structured Output with JSON Schema

To prevent the model from adding "chatter" (e.g., "Sure, here is your JSON:"), use a **JSON Schema** via the `responseConstraint` field. This ensures the output is valid JSON that can be parsed immediately.

### Example: Sentiment Classification

```javascript
// Pass the schema as a plain object — do not JSON.stringify() it first.
const schema = {
	type: 'object',
	properties: {
		rating: { type: 'number', minimum: 1, maximum: 5 },
		is_positive: { type: 'boolean' },
	},
	required: ['rating', 'is_positive'],
};

const result = await session.prompt(
	"Rate the following feedback: 'The food was great!'",
	{ responseConstraint: schema },
);

const data = JSON.parse(result);
console.log(data.rating); // 5
```

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


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-model/guide.md#L149-L238). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
