Related section: [Autofill payment form](overview.md).
### Help users avoid re-entering payment data

Make sure to add appropriate `autocomplete` values in payment card forms. Without autocomplete, users may keep a physical record of payment card details or store them insecurely.

```html
<!-- cc-number tells autofill this is a card number, not a generic number field -->
<!-- inputmode="numeric" gives a numeric keyboard without the increment/decrement spinner -->
<!-- DO NOT use type="number" — it adds increment/decrement controls and strips leading zeros -->
<input id="cc-number" name="cc-number" type="text" autocomplete="cc-number"
       inputmode="numeric" maxlength="19" pattern="[\d ]{13,19}" required>

<!-- cc-name autofills with the name exactly as it appears on the card; Unicode pattern allows international names -->
<input id="cc-name" name="cc-name" type="text" autocomplete="cc-name"
       maxlength="50" pattern="[\p{L} \-\.]+" required>

<!-- cc-exp autofills the full expiry date as MM/YY -->
<!-- MANDATORY: Place format hints above the input so autocomplete popovers or virtual keyboards do not obscure them during editing -->
<span id="exp-hint" class="hint">Format: MM/YY</span>
<input id="cc-exp" name="cc-exp" type="text" autocomplete="cc-exp"
       aria-describedby="exp-hint" maxlength="5" required>

<!-- cc-csc autofills the security code; DO NOT use type="password" here -->
<input id="cc-csc" name="cc-csc" type="text" autocomplete="cc-csc"
       inputmode="numeric" maxlength="4" pattern="[0-9]{3,4}" required>
```

### Show format hints above the input

Where a field has a required format (for example the `MM/YY` expiry date), put the hint in a visible element **above** the input and link the two with `aria-describedby`, as in the `cc-exp` example above. Hints that sit below an input are easily hidden by the mobile keyboard or by the autofill popover at the moment the user needs them.

Don't rely on the `placeholder` attribute as the only format hint, and never use it instead of a `<label>`: placeholder text is hidden as soon as the user starts typing, so it can't be checked against while editing. A placeholder is fine as an extra cue alongside the label and the persistent hint.

### Don't mask the security code

Use `type="text"` with `inputmode="numeric"` for the card security code, not `type="password"`. Users can't check a masked three- or four-digit code for typos, so a mistyped digit isn't caught until the payment is declined, and masking adds little protection because the code is printed on the card the user is holding.

### Use a single input for payment card and phone numbers

For payment card and phone numbers use a single input: don't split the number into parts. That makes it easier for users to enter data, makes validation simpler, and enables browsers to autofill. Consider doing the same for other numeric data such as PIN and bank codes.

### Validate carefully

You should validate data entry both in realtime and before form submission. One way to do this is by adding a pattern attribute to a payment card input. If the user attempts to submit the payment form with an invalid value, the browser displays a warning message and sets focus on the input.

However, your pattern regular expression must be flexible enough to handle the range of payment card number lengths: from 14 digits (or possibly less) to 20 (or more). Card security codes (also known as CSC, CVC, CVV, or other names) consist of 3 or 4 digits.

Allow users to include spaces when they're entering a new payment card number, since this is how numbers are displayed on physical cards. That's friendlier to the user (you won't have to tell them "they did something wrong"), less likely to interrupt conversion flow, and it's straightforward to remove spaces in numbers before processing.

### Help save users from accidentally missing data fields

Add the `required` attribute to mandatory fields. Modern browsers automatically prompt and set focus for missing data.

## Fallback strategies

Baseline status for enterkeyhint: Widely available. It's been Baseline since 2021-11-02.
Supported by: Chrome 77 (Sep 2019), Edge 79 (Jan 2020), Firefox 94 (Nov 2021), Safari 13.1 (Mar 2020), and Safari iOS 13.4 (Mar 2020).

Baseline status for Email, telephone, and URL `<input>` types: Widely available. It's been Baseline since 2015-07-29.
Supported by: Chrome 5 (May 2010), Edge 12 (Jul 2015), Firefox 4 (Mar 2011), Safari 5 (Jun 2010), and Safari iOS 3 (Jun 2009).

Baseline status for inputmode: Widely available. It's been Baseline since 2021-12-07.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 95 (Dec 2021), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

Autofill is a progressive enhancement. In browsers that do not support autofill, users will simply need to manually enter their payment details. The semantic HTML constraints (such as `type`, `inputmode`, `pattern`, and `required`) will still function appropriately to validate user input and provide the correct virtual keyboards.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/forms/autofill-payment-form.md#L79-L142). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
