### Container Style Queries

Baseline status for Container style queries: Newly available. It's been Baseline since 2026-05-19.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 151 (May 2026), and Safari 18 (Sep 2024).

To support browsers without Container Style Queries, use classes or component selectors as fallback hooks. Keep icon selection in custom properties; inline-style selectors alone miss icons assigned through CSS rules.

```css
:where(.icon-start, .icon:empty)::before {
  content: image-set(linear-gradient(transparent 0 100%), var(--icon-start)) / var(--icon-style-alt, "");
  /* icon styles */
}

:where(.icon-start)::before {
  --icon-start: inherit;
}

:where(.icon:empty)::before {
  --icon-start: var(--icon);
}

:where(.icon-start:not(.icon, :empty))::before {
  margin-inline-end: var(--icon-style-spacing, 0.3em);
}
```

For trailing icons, use the same class-hook fallback with `.icon-end`, `--icon-end`, and `::after` instead of `.icon-start`, `--icon-start`, and `::before`. Apply spacing to non-empty content with `margin-inline-start` instead of `margin-inline-end`.

This `image-set()` pattern makes `content` invalid when the custom property is unset, so it falls back to `none` and the pseudo-element disappears without adding or removing a class. It does not remove the pseudo-element's other styles or prevent conflicts with other `::before` or `::after` rules, so use these hooks only where those pseudo-elements are available for icons.

### Safari Browser Workarounds

Safari has two rendering bugs affecting icons: WebKit [#301609](https://bugs.webkit.org/show_bug.cgi?id=301609) can prevent them from appearing until user interaction, and [#320220](https://bugs.webkit.org/show_bug.cgi?id=320220) also affects their rendering. The workaround below addresses both:

```css
@keyframes webkit-301609 {}

@supports ((-webkit-nbsp-mode: normal) or (-webkit-touch-callout: none) or (font: -apple-system-body)) and (content-visibility: auto) {
  @layer webkit-301609-fix {
    ::before, ::after {
      animation: webkit-301609 0s;
    }
  }
}
```

The `@supports` query targets Safari only, and `@layer` reduces animation conflicts.

WebKit bug #325900 can prevent a direct override of `--icon-start` from taking effect in some cases, such as changing the icon on hover. This affects the workaround for non-inheriting registered properties. For Safari, register `--icon-start` as inheriting and reset it on descendants inside the style query:

```css
@supports ((-webkit-nbsp-mode: normal) or
           (-webkit-touch-callout: none) or
           (font: -apple-system-body)) and (content-visibility: auto) {
  /* Override previous declaration */
  @property --icon-start {
    syntax: "*";
    inherits: true;
  }

  @layer webkit-325900-fix {
    @container style(--icon-start) {
      * {
        --icon-start: initial;
      }
    }
  }
}
```

The reset prevents the icon value from propagating to descendants. Keeping it in a layer lets unlayered icon declarations take precedence over the reset.

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance/blob/64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65/skills/modern-web-guidance/guides/ui-atoms/icons.md#L221-L291). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
