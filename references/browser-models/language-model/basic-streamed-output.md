### Basic and Streamed Output

For short responses, use `prompt()`. For longer content, use `promptStreaming()` to provide a more responsive UI.

**MANDATORY**: Never assign model output to `innerHTML`. Model output is untrusted and can contain injected markup. Always use `textContent` or a sanitizer.

```javascript
const session = await LanguageModel.create();

// prompt() accumulates the full response before resolving — use for short, one-shot output.
const result = await session.prompt('Write a haiku about coding.');
// textContent, not innerHTML — model output is untrusted and must not be parsed as markup.
outputEl.textContent = result;

// promptStreaming() yields independent chunks that must be concatenated;
// use for longer content so each chunk can be rendered progressively.
const stream = session.promptStreaming('Write a long story about a robot.');
let completeResult = '';
outputEl.setAttribute('aria-busy', 'true'); // outputEl: <div aria-live="polite">
try {
	for await (const chunk of stream) {
		completeResult += chunk;
		outputEl.append(chunk);
	}
} finally {
	outputEl.setAttribute('aria-busy', 'false');
}
console.log('Full story:', completeResult);
```

Make the element that receives the output a polite live region that is in the page from page load, and set `aria-busy="true"` on it while a response streams in, so assistive technologies announce the complete response rather than each chunk (WCAG 4.1.3 Status Messages). Don't move focus while it streams in.

**MANDATORY:** If the output language differs from the page language, set `lang` on the output element to the language declared in `expectedOutputs`, so screen readers pronounce it correctly (WCAG 3.1.2 Language of Parts).

### Multimodal Input

The Prompt API supports text, audio, and visual inputs (images, canvas, video frames).

```javascript
const session = await LanguageModel.create({
	// Declaring expected input types lets the browser optimize model loading.
	expectedInputs: [{ type: 'text' }, { type: 'image' }],
	expectedOutputs: [{ type: 'text' }],
});

const response = await session.prompt([
	{
		role: 'user',
		content: [
			{ type: 'text', value: 'What is in this image?' },
			{ type: 'image', value: document.querySelector('canvas') },
		],
	},
]);
```

## 3. Advanced Session Management

Sessions allow the model to maintain context across multiple interactions.

### Context and Quota

Each session has a maximum token limit. You can monitor usage via `session.contextUsage` and `session.contextWindow`. If the window overflows, the oldest messages (except the system prompt) are dropped.

### Cloning Sessions

Cloning is efficient for starting parallel conversations that share the same initial context (like a "system" personality) without re-initializing.

```javascript
const mainSession = await LanguageModel.create({
	initialPrompts: [{ role: 'system', content: 'You speak like a pirate.' }],
});

const branchA = await mainSession.clone();
const branchB = await mainSession.clone();

// Run independent tasks on each clone, then destroy the clones when done.
await branchA.prompt('Greet the crew.');
branchA.destroy();

await branchB.prompt('Chart a course.');
branchB.destroy();

// Keep mainSession if you plan to clone it again later, or destroy it once no more clones are needed.
mainSession.destroy();
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/language-model/guide.md#L62-L148). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
