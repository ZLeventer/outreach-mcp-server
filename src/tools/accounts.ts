import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutreachClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerAccountTools(server: McpServer, client: OutreachClient): void {
  server.registerTool(
    "list_accounts",
    {
      description: "List Outreach accounts (companies). Returns name, domain, owner, and custom fields.",
      inputSchema: {
        "filter[name]": z.string().optional(),
        "filter[domain]": z.string().optional(),
        "filter[owner][id]": z.string().optional(),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
        sort: z.string().optional().describe("e.g. 'name', '-createdAt'"),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/accounts", { query: args })),
  );

  server.registerTool(
    "get_account",
    {
      description: "Fetch a single Outreach account by ID.",
      inputSchema: {
        id: z.number().int().describe("Outreach account ID"),
      },
    },
    async ({ id }) =>
      asResult(await client.request("GET", `/accounts/${id}`)),
  );

  server.registerTool(
    "create_account",
    {
      description: "Create a new account in Outreach.",
      inputSchema: {
        name: z.string(),
        domain: z.string().optional(),
        websiteUrl: z.string().url().optional(),
        description: z.string().optional(),
        industry: z.string().optional(),
        locality: z.string().optional(),
        ownerId: z.number().int().optional(),
        tags: z.array(z.string()).optional(),
      },
    },
    async ({ ownerId, ...attributes }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "account",
          attributes,
          relationships: {} as Record<string, unknown>,
        },
      };
      if (ownerId) {
        (body["data"] as { relationships: Record<string, unknown> }).relationships["owner"] = {
          data: { type: "user", id: String(ownerId) },
        };
      }
      return asResult(await client.request("POST", "/accounts", { body }));
    },
  );

  server.registerTool(
    "update_account",
    {
      description: "Update an existing Outreach account.",
      inputSchema: {
        id: z.number().int(),
        name: z.string().optional(),
        domain: z.string().optional(),
        websiteUrl: z.string().url().optional(),
        description: z.string().optional(),
        industry: z.string().optional(),
        ownerId: z.number().int().optional(),
        tags: z.array(z.string()).optional(),
      },
    },
    async ({ id, ownerId, ...attributes }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "account",
          id: String(id),
          attributes,
          relationships: {} as Record<string, unknown>,
        },
      };
      if (ownerId) {
        (body["data"] as { relationships: Record<string, unknown> }).relationships["owner"] = {
          data: { type: "user", id: String(ownerId) },
        };
      }
      return asResult(await client.request("PATCH", `/accounts/${id}`, { body }));
    },
  );
}
