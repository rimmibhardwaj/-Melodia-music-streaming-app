# Custom Rules

## Prompt Tracking
Whenever the user gives a new prompt or request, you MUST document it in the "Prompt Tracker" page in the user's Notion workspace.

### Instructions:
1. Use the `notion-mcp-server` tool `API-update-page-markdown` to append the new prompt as a markdown table row or a formatted block structure simulating a database.
2. The ID for the "Prompt Tracker" page is: `3982f48a-ebb6-815a-bf99-f0f5f38d0869`
3. Make sure to append the prompt accurately in a database format with the following columns/fields:
   - **Prompt**: The exact prompt text.
   - **Quality**: The quality of the prompt (e.g., Good, Needs Improvement).
   - **Suggestions for Improvement**: Suggestions on how to improve the prompt.
