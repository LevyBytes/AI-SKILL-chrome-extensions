### 2. Executing Translations

The API supports both static and streaming responses. Always include download progress monitoring when instantiating the translator.

**Standard Translation:**

```javascript
// Default to including a progress monitor when creating translator
const translator = await Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${Math.round(e.loaded * 100)}%`);
    });
  },
});

const result = await translator.translate(
  'Where is the next bus stop, please?',
);
console.log(result);
// Output: "Où est le prochain arrêt de bus, s'il vous plaît ?"
```

**Streaming Translation (for long text):**

```javascript
const stream = translator.translateStreaming(longText);
for await (const chunk of stream) {
  console.log(chunk);
}
```

## Supported Languages

The API supports a wide range of BCP 47 language codes: Here are the languages supported by Chrome's implementation of the Translator API:

- **ar**: Arabic
- **bg**: Bulgarian
- **bn**: Bengali
- **cs**: Czech
- **da**: Danish
- **de**: German
- **el**: Greek
- **en**: English
- **es**: Spanish
- **fi**: Finnish
- **fr**: French
- **hi**: Hindi
- **hr**: Croatian
- **hu**: Hungarian
- **id**: Indonesian
- **it**: Italian
- **he**: Hebrew
- **ja**: Japanese
- **kn**: Kannada
- **ko**: Korean
- **lt**: Lithuanian
- **mr**: Marathi
- **nl**: Dutch
- **no**: Norwegian
- **pl**: Polish
- **pt**: Portuguese
- **ro**: Romanian
- **ru**: Russian
- **sk**: Slovak
- **sl**: Slovenian
- **sv**: Swedish
- **ta**: Tamil
- **te**: Telugu
- **th**: Thai
- **tr**: Turkish
- **uk**: Ukrainian
- **vi**: Vietnamese
- **zh**: Chinese
- **zh-Hant**: Chinese (Traditional)

## Accessibility considerations

**MANDATORY:** Apply the `lang` attribute to the container element for the translated content, and make sure that its value matches the BCP 47 language code for the target language, for example `lang="es"` for Spanish.

## Security & Performance

- **Permissions Policy:** Cross-origin iframes require explicit permission.

  ```html
  <iframe src="https://example.com/" allow="translator"></iframe>
  ```

- **Web Workers:** Currently **not supported** due to Permission Policy
  complexities.
- **Privacy:** No data is sent to Google servers during the translation process
  once the model is downloaded.


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/built-in-ai/translator/guide.md#L85-L179). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
