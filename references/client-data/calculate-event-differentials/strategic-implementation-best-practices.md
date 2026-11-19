Related section: [Calculate event differentials](overview.md).
## Strategic Implementation & Best Practices

- **DO** use `Temporal.ZonedDateTime` for calculations involving real-world events that occur in specific time zones (like subscription renewals or event countdowns), and pass an explicit `timeZone` to `Temporal.Now.zonedDateTimeISO(timeZone)` when calculating against a zone other than the system default.
- **DO** combine separate date and time strings with Temporal methods, e.g. `Temporal.PlainDate.from(dateStr).toPlainDateTime(timeStr).toZonedDateTime(tz)` or `Temporal.PlainDate.from(dateStr).toZonedDateTime({ timeZone: tz, plainTime: timeStr })`, instead of interpolating an ISO string like `` `${dateStr}T${timeStr}` ``.
- **DO** pass `largestUnit` (e.g. `'day'`, `'month'`, `'year'`) in `.since()`, `.until()`, or `.round()` when you want durations balanced beyond hours; `ZonedDateTime` difference methods default to `'hour'`.
- **DO** use `Temporal.Duration.compare(d1, d2, { relativeTo })` when comparing two durations, providing a `relativeTo` anchor whenever either duration involves calendar units (`months`, `years`) or time-zone-aware days.
- **DO** format durations for user display using `duration.toLocaleString()` or `new Intl.DurationFormat(locale, { style })` (`'long'`, `'short'`, `'narrow'`, or `'digital'`) instead of manually interpolating `${duration.years}y ${duration.months}m...`.
- **DO** use `duration.toString()` for machine-readable ISO 8601 duration strings (e.g., `PT1H30M`), never as user-facing copy.
- **DO** render a `PlainTime` as `HH:MM` (e.g., for `<input type="time">`) using `.toPlainTime().toString({ smallestUnit: 'minute' })` rather than string `.slice(0, 5)`.
- **DO NOT** modify instances directly; `Temporal` objects are **immutable**. Operations like `.add()`, `.subtract()`, `.round()`, or `.with()` return a *new* instance.
- **DO NOT** fall back to `Date` / `.getTime()` arithmetic for the differential itself; `Date` has no time-zone-aware calendar math and only millisecond precision.
- **DO** use the native `.sign` property of the computed `Temporal.Duration` (or `Temporal.ZonedDateTime.compare()`) to check if a duration represents a past/expired time point (`sign < 0`) or a future pending start.

## Fallback Strategy

{{ FEATURE_FALLBACKS("temporal") }}

### Intl.DurationFormat

{{ BASELINE_STATUS("intl-duration-format") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/js/calculate-event-differentials/guide.md#L83-L102). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
