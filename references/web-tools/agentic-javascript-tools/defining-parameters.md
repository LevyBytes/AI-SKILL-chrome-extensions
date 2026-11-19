## Defining Parameters

Parameters (params) are defined using the `inputSchema` property. This must be a **JSON Schema** object that describes the structured data the tool expects.

```javascript
await document.modelContext.registerTool({
  name: "calculate_area",
  description: "Calculates the area of a rectangle.",
  inputSchema: {
    type: "object",
    properties: {
      width: { type: "number", description: "The width of the rectangle." },
      height: { type: "number", description: "The height of the rectangle." }
    },
    required: ["width", "height"]
  },
  execute(input) {
    // input is { width: 10, height: 20 }
    return input.width * input.height;
  },
  annotations: { readOnlyHint: true }
});
```

## Writing Tool and Parameter Descriptions

The agent already receives the full `inputSchema`, so the `description` only needs to say what the tool does and when to use it. **DO NOT** repeat parameter names, types, `enum` values, defaults, or limits in it; declare them in the schema (`enum`, `default`, `minimum`/`maximum`) instead. Parameter descriptions follow the same rule: say what the value means, not its type or allowed values.

The browser does not validate arguments against `inputSchema` or apply `default` values, so do both in `execute`.

```javascript
const SORT_ORDERS = ["newest", "price_low_to_high"];

await document.modelContext.registerTool({
  name: "search_products",
  // Don't list the sort orders here, even via SORT_ORDERS: `enum` already does.
  description: "Searches the product catalog by keyword. Use when the user wants to find or compare products.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Words to search for." },
      sort: { type: "string", enum: SORT_ORDERS, default: "newest", description: "Order of the results." },
    },
    required: ["query"],
  },
  async execute({ query, sort = "newest" }, { signal }) {
    if (typeof query !== "string" || !SORT_ORDERS.includes(sort)) {
      return { error: "Pass a search query and a supported sort order.", sortOrders: SORT_ORDERS };
    }
    return await productService.search({ query, sort }, { signal });
  },
  annotations: { readOnlyHint: true },
});
```

## Execution Patterns

The `execute` callback always receives two arguments: the input object, and an options object carrying an `AbortSignal` — `execute(inputObject, { signal })`.

### When to use `async execute`
Use `async` when the tool involves operations that return a Promise or take time to complete:
- **Network calls**: Fetching data from an API.
- **Asynchronous Storage**: Accessing IndexedDB.
- **External Events**: Waiting for a specific state change or animation to finish.

```javascript
async execute(input, { signal }) {
  const response = await fetch(`/api/data/${input.id}`, { signal });
  return await response.json();
}
```

### When to use `execute` (Synchronous)
Use a standard synchronous function for immediate operations. A synchronous tool runs to completion before cancellation can be observed, so it can ignore the signal:
- **Pure logic**: Math, filtering, or sorting data already in memory.
- **Synchronous state**: Reading from `localStorage` or a synchronous state manager.

```javascript
execute(input) {
  return input.items.filter(item => item.active);
}
```


GoogleChrome Modern Web Guidance contributors. [Original document](https://github.com/GoogleChrome/modern-web-guidance-src/blob/e8feb43e0e61c791f905904222492bf2e4e573fe/guides/webmcp/agentic-javascript-tools/guide.md#L73-L155). [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Upstream credits Mozilla Contributors, W3C, WHATWG and IETF. Reorganized for this edition.
