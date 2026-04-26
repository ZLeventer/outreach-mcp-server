import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OutreachClient } from "../client.js";
import { asResult } from "./_shared.js";

export function registerTaskTools(server: McpServer, client: OutreachClient): void {
  server.registerTool(
    "list_tasks",
    {
      description: "List Outreach tasks with optional filters. Returns task type, due date, completion status, and linked prospect.",
      inputSchema: {
        "filter[owner][id]": z.string().optional(),
        "filter[prospect][id]": z.string().optional(),
        "filter[completed]": z.boolean().optional(),
        "filter[taskType]": z.enum(["call", "email", "action_item"]).optional(),
        "filter[dueDateAt][gte]": z.string().optional().describe("ISO8601 datetime"),
        "filter[dueDateAt][lte]": z.string().optional().describe("ISO8601 datetime"),
        "page[size]": z.number().int().min(1).max(1000).optional().default(50),
        "page[number]": z.number().int().min(1).optional().default(1),
      },
    },
    async (args) =>
      asResult(await client.request("GET", "/tasks", { query: args })),
  );

  server.registerTool(
    "create_task",
    {
      description: "Create a new task in Outreach for a prospect.",
      inputSchema: {
        subject: z.string(),
        taskType: z.enum(["call", "email", "action_item"]).optional().default("action_item"),
        dueDate: z.string().optional().describe("ISO8601 datetime"),
        note: z.string().optional(),
        prospectId: z.number().int().optional(),
        ownerId: z.number().int().optional(),
      },
    },
    async ({ prospectId, ownerId, ...attributes }) => {
      const body: Record<string, unknown> = {
        data: {
          type: "task",
          attributes,
          relationships: {} as Record<string, unknown>,
        },
      };
      const rels = (body["data"] as { relationships: Record<string, unknown> }).relationships;
      if (prospectId) rels["prospect"] = { data: { type: "prospect", id: String(prospectId) } };
      if (ownerId) rels["owner"] = { data: { type: "user", id: String(ownerId) } };
      return asResult(await client.request("POST", "/tasks", { body }));
    },
  );

  server.registerTool(
    "complete_task",
    {
      description: "Mark an Outreach task as completed.",
      inputSchema: {
        id: z.number().int().describe("Outreach task ID"),
        completedAt: z.string().optional().describe("ISO8601 datetime — defaults to now"),
      },
    },
    async ({ id, completedAt }) => {
      const body = {
        data: {
          type: "task",
          id: String(id),
          attributes: { completed: true, completedAt: completedAt ?? new Date().toISOString() },
        },
      };
      return asResult(await client.request("PATCH", `/tasks/${id}`, { body }));
    },
  );
}
