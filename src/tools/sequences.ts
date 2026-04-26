import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutreachClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerSequenceTools(server: McpServer, client: OutreachClient): void {
  server.registerTool(
    "list_sequences",
    {
      description: "List Outreach sequences with step counts, prospect counts, and reply/bounce stats.",
      inputSchema: {
        "filter[name]": z.string().optional(),
        "filter[enabled]": z.boolean().optional(),
        "filter[owner][id]": z.string().optional(),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/sequences", { query: args })),
  );

  server.registerTool(
    "get_sequence",
    {
      description: "Fetch a single Outreach sequence by ID, including steps and performance metrics.",
      inputSchema: {
        id: z.number().int().describe("Outreach sequence ID"),
      },
    },
    async ({ id }) =>
      asResult(await client.request("GET", `/sequences/${id}`)),
  );

  server.registerTool(
    "list_sequence_steps",
    {
      description: "List all steps (emails, calls, tasks) in an Outreach sequence.",
      inputSchema: {
        "filter[sequence][id]": z.string().describe("Outreach sequence ID"),
        "page[size]": z.number().int().min(1).max(1000).optional().default(100),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/sequenceSteps", { query: args })),
  );

  server.registerTool(
    "list_sequence_states",
    {
      description:
        "List sequence state records — which prospects are in which sequence and what step they are on.",
      inputSchema: {
        "filter[sequence][id]": z.string().optional().describe("Filter by sequence ID"),
        "filter[prospect][id]": z.string().optional().describe("Filter by prospect ID"),
        "filter[state]": z
          .enum(["active", "finished", "paused", "pending", "bounced", "opted_out", "excluded"])
          .optional(),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/sequenceStates", { query: args })),
  );

  server.registerTool(
    "add_prospect_to_sequence",
    {
      description: "Add a prospect to an Outreach sequence.",
      inputSchema: {
        prospectId: z.number().int(),
        sequenceId: z.number().int(),
        mailboxId: z.number().int().optional().describe("Mailbox to send from"),
      },
    },
    async ({ prospectId, sequenceId, mailboxId }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "sequenceState",
          relationships: {
            prospect: { data: { type: "prospect", id: String(prospectId) } },
            sequence: { data: { type: "sequence", id: String(sequenceId) } },
            ...(mailboxId ? { mailbox: { data: { type: "mailbox", id: String(mailboxId) } } } : {}),
          },
        },
      };
      return asResult(await client.request("POST", "/sequenceStates", { body }));
    },
  );
}
