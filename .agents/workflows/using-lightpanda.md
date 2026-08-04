---
description: Use when you need to perform browser-based tasks like research, checking documentation, or verifying UI
---

# Using Lightpanda

Use this workflow to perform high-performance, headless browser tasks using Lightpanda.

## Steps

1. **Navigate to the Target URL**:
   - Use `mcp_lightpanda_goto` with the target `url`.
   - Verify the navigation was successful.

2. **Extract Content for Context**:
   - For a general overview: Use `mcp_lightpanda_markdown`.
   - For structured data/accessibility: Use `mcp_lightpanda_semantic_tree`.
   - For discovering further resources: Use `mcp_lightpanda_links`.

3. **Interact with the Page (if needed)**:
   - To find specific elements: Use `mcp_lightpanda_waitForSelector`.
   - To interact: Use `mcp_lightpanda_click` or `mcp_lightpanda_fill` using the `backendNodeId` from the selector or semantic tree.

4. **Summarize and Act**:
   - Extract the necessary information to fulfill the user's request.
   - If research is for documentation, prefer `mcp_lightpanda_markdown` for the most readable format.

// turbo

5. When researching, always prioritize the official documentation or a "What's New" section if the user is looking for the latest updates.
