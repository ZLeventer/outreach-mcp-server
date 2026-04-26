import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutreachClient } from "../client.js";
import { asResult, wrapBody } from "./_shared.js";

export function registerProspectTools(server: McpServer, client: OutreachClient): void {
  server.registerTool(
    "list_prospects",
    {
      description:
        "List Outreach prospects with optional filters. Returns name, email, title, company, stage, and sequence membership.",
      inputSchema: {
        "filter[emails]": z.string().optional().describe("Filter by email address"),
        "filter[lastName]": z.string().optional(),
        "filter[firstName]": z.string().optional(),
        "filter[company]": z.string().optional(),
        "filter[title]": z.string().optional(),
        "filter[owner][id]": z.string().optional().describe("Filter by owner user ID"),
        "filter[stage][id]": z.string().optional().describe("Filter by prospect stage ID"),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
        sort: z.string().optional().describe("Sort field e.g. 'lastName', '-createdAt'"),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/prospects", { query: args })),
  );

  server.registerTool(
    "get_prospect",
    {
      description: "Fetch a single Outreach prospect by ID.",
      inputSchema: {
        id: z.number().int().describe("Outreach prospect ID"),
      },
    },
    async ({ id }) =>
      asResult(await client.request("GET", `/prospects/${id}`)),
  );

  server.registerTool(
    "create_prospect",
    {
      description: "Create a new prospect in Outreach.",
      inputSchema: {
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        emails: z.array(z.string().email()).optional(),
        title: z.string().optional(),
        company: z.string().optional(),
        phoneNumbers: z
          .array(z.object({ number: z.string(), order: z.number().int(), type: z.string() }))
          .optional(),
        tags: z.array(z.string()).optional(),
        ownerId: z.number().int().optional().describe("Outreach user ID"),
        accountId: z.number().int().optional().describe("Outreach account ID"),
      },
    },
    async (args) => {
      const { ownerId, accountId, ...attributes } = args;
      const body: Record<string, unknown> = {
        data: {
          type: "prospect",
          attributes,
          relationships: {} as Record<string, unknown>,
        },
      };
      const relationships = body["data"] as { relationships: Record<string, unknown> };
      if (ownerId) relationships.relationships["owner"] = { data: { type: "user", id: String(ownerId) } };
      if (accountId) relationships.relationships["account"] = { data: { type: "account", id: String(accountId) } };
      return asResult(await client.request("POST", "/prospects", { body }));
    },
  );

  server.registerTool(
    "update_prospect",
    {
      description: "Update an existing Outreach prospect.",
      inputSchema: {
        id: z.number().int(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        title: z.string().optional(),
        company: z.string().optional(),
        tags: z.array(z.string()).optional(),
        ownerId: z.number().int().optional(),
        accountId: z.number().int().optional(),
        stageId: z.number().int().optional().describe("Prospect stage ID"),
      },
    },
    async ({ id, ownerId, accountId, stageId, ...attributes }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "prospect",
          id: String(id),
          attributes,
          relationships: {} as Record<string, unknown>,
        },
      };
      const relationships = (body["data"] as { relationships: Record<string, unknown> }).relationships;
      if (ownerId) relationships["owner"] = { data: { type: "user", id: String(ownerId) } };
      if (accountId) relationships["account"] = { data: { type: "account", id: String(accountId) } };
      if (stageId) relationships["stage"] = { data: { type: "stage", id: String(stageId) } };
      return asResult(await client.request("PATCH", `/prospects/${id}`, { body }));
    },
  );

  server.registerTool(
    "delete_prospect",
    {
      description: "Delete an Outreach prospect by ID.",
      inputSchema: {
        id: z.number().int().describe("Outreach prospect ID"),
      },
    },
    async ({ id }) =>
      asResult(await client.request("DELETE", `/prospects/${id}`)),
  );
}
