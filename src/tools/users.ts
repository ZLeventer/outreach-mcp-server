import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutreachClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerUserTools(server: McpServer, client: OutreachClient): void {
  server.registerTool(
    "list_users",
    {
      description: "List all Outreach users in the workspace.",
      inputSchema: {
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/users", { query: args })),
  );

  server.registerTool(
    "get_current_user",
    {
      description: "Fetch the Outreach user associated with the current access token.",
      inputSchema: {},
    },
    async () => asResult(await client.request("GET", "/users/me")),
  );

  server.registerTool(
    "list_mailboxes",
    {
      description: "List email mailboxes connected to Outreach. Use mailbox IDs when adding prospects to sequences.",
      inputSchema: {
        "filter[userId]": z.string().optional().describe("Filter by user ID"),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/mailboxes", { query: args })),
  );
}
