Related section: [Capture location agnostic data](overview.md).
### Example: Recurring Monthly Intervals (`overflow: 'constrain'` vs `'reject'`)

```javascript
const billingStart = Temporal.PlainDate.from('2024-01-31');

// Default overflow: 'constrain' clamps Jan 31 + 1 month to the last valid day of February
const nextBilling = billingStart.add({ months: 1 }, { overflow: 'constrain' });
console.log(nextBilling.toString()); // "2024-02-29" (2024 is a leap year)

// Use overflow: 'reject' to throw a RangeError when the target day does not exist
try {
  billingStart.add({ months: 1 }, { overflow: 'reject' });
} catch (err) {
  // RangeError: day 31 does not exist in February
}
```

### Example: Interoperating with Legacy `Date`

A legacy `Date` is a timestamp (an instant), not a calendar date. Storing `"1990-01-01"` as a `Date` forces you to pick *some* instant (typically midnight UTC), and reading it back in a time zone west of UTC yields `"31/12/1989"`. If a library or API still requires a `Date`, convert explicitly through `Temporal.Instant` rather than building ISO strings by hand:

```javascript
// PlainDate -> Date: attach a time zone (time of day defaults to the start of
// that day) to get an Instant, then hand the epoch milliseconds to Date.
// 'UTC' is a deliberate choice and must be documented; any zone would do,
// but the stored instant depends on it.
const instant = birthdate.toZonedDateTime('UTC').toInstant();
const legacyDate = new Date(instant.epochMilliseconds);

// Date -> PlainDate: go back through Instant (legacyDate.toTemporalInstant()
// is equivalent), then project into an explicit time zone. The result depends
// on the zone, which is exactly the drift risk.
const viewedDate = Temporal.Instant.fromEpochMilliseconds(legacyDate.getTime())
  .toZonedDateTimeISO('America/New_York')
  .toPlainDate();

// Compare Plain types with .equals() (or Temporal.PlainDate.compare), not strings.
console.log(viewedDate.equals(birthdate)); // false: the calendar date drifted to 1989-12-31
```

## Strategic Implementation & Best Practices

- **DO** use `Temporal.PlainDate` for full calendar dates, `Temporal.PlainTime` for wall-clock times, `Temporal.PlainDateTime` for local date-time pairs without a zone, `Temporal.PlainMonthDay` for recurring annual dates, and `Temporal.PlainYearMonth` for year-month expirations or billing periods.
- **DO NOT** perform arithmetic directly on `Temporal.PlainMonthDay`; convert it to a `Temporal.PlainDate` first via `.toPlainDate({ year })` because month lengths vary by year.
- **DO** use `.add()` on `Temporal.PlainDate` for recurring calendar intervals, relying on `overflow: 'constrain'` (the default) to clamp month-end dates or `overflow: 'reject'` to throw a `RangeError` on nonexistent dates.
- **DO** specify `calendar` (e.g., `calendar: 'iso8601'`) when constructing `PlainMonthDay` or non-ISO Plain types from objects.
- **DO NOT** use Plain types if you need to represent a specific moment in physical time (an instant). Use `Temporal.Instant` or `Temporal.ZonedDateTime` for logs, event timestamps, or cross-timezone scheduling.
- **DO NOT** construct `Date` objects from hand-built ISO strings (such as `` `${date}T00:00:00Z` ``). Produce a `Date` from the `epochMilliseconds` of a `Temporal.Instant` or `Temporal.ZonedDateTime`, and read one back with `Temporal.Instant.fromEpochMilliseconds(date.getTime())` or `date.toTemporalInstant()`, so the time zone assumption is explicit.
- **DO NOT** use `Intl.DateTimeFormat.prototype.formatToParts()` to extract or compare year, month, or day values. Read `.year`, `.month`, and `.day` directly from a Plain type, and compare with `.equals()`.
- **DO** identify time zones by IANA name (e.g., `America/New_York`) and never by a fixed UTC offset. Offsets change with daylight saving time and legislation, so labels like `"UTC-5"` become wrong for part of the year.
- **DO** remember that `Temporal` objects are **immutable**. Methods like `.add()`, `.subtract()`, or `.with()` always return a new instance with a new reference rather than mutating the original object in place, making them safe to store directly in reactive UI state.

## Fallback Strategy

{{ FEATURE_FALLBACKS("temporal") }}

GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/js/capture-location-agnostic-data/guide.md#L80-L134). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
