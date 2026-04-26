# outreach-mcp-server

MCP server for [Outreach](https://www.outreach.io/) — manage prospects, accounts, sequences, tasks, and sales engagement through Claude and other MCP clients.

## Tools

| Tool | Description |
|------|-------------|
| `list_prospects` | List prospects with optional filters (email, company, title, owner, stage) |
| `get_prospect` | Fetch a single prospect by ID |
| `create_prospect` | Create a new prospect |
| `update_prospect` | Update an existing prospect |
| `delete_prospect` | Delete a prospect by ID |
| `list_accounts` | List accounts with optional filters |
| `get_account` | Fetch a single account by ID |
| `create_account` | Create a new account |
| `update_account` | Update an existing account |
| `list_sequences` | List sequences with step counts and performance stats |
| `get_sequence` | Fetch a sequence with step details |
| `list_sequence_steps` | List all steps in a sequence |
| `list_sequence_states` | List which prospects are in which sequence step |
| `add_prospect_to_sequence` | Enroll a prospect in a sequence |
| `list_tasks` | List tasks filtered by owner, prospect, due date, or type |
| `create_task` | Create a new call/email/action task for a prospect |
| `complete_task` | Mark a task as completed |
| `list_users` | List all users in the workspace |
| `get_current_user` | Fetch the user for the current access token |
| `list_mailboxes` | List connected email mailboxes |

## Installation

```bash
npx outreach-mcp-server
```

### Environment variable

| Variable | Description |
|----------|-------------|
| `OUTREACH_ACCESS_TOKEN` | Outreach OAuth access token — obtain via the [Outreach OAuth flow](https://developers.outreach.io/api/oauth/) |

## Claude Desktop config

```json
{
  "mcpServers": {
    "outreach": {
      "command": "npx",
      "args": ["-y", "outreach-mcp-server"],
      "env": {
        "OUTREACH_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

## Authentication

Outreach uses OAuth 2.0. Register your app at [developers.outreach.io](https://developers.outreach.io), complete the OAuth flow, and pass the resulting access token as `OUTREACH_ACCESS_TOKEN`. Access tokens expire; use the refresh token to obtain new ones.

## Links

- [Outreach API Documentation](https://developers.outreach.io/api/)
- [Outreach OAuth Guide](https://developers.outreach.io/api/oauth/)
