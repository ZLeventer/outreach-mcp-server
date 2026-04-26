#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OutreachClient } from "./client.js";
import { registerProspectTools } from "./tools/prospects.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerSequenceTools } from "./tools/sequences.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerUserTools } from "./tools/users.js";

async function main() {
  const accessToken = process.env.OUTREACH_ACCESS_TOKEN;
  if (!accessToken) {
    console.error(
      "OUTREACH_ACCESS_TOKEN is not set. Obtain one via Outreach OAuth at developers.outreach.io.",
    );
    process.exit(1);
  }

  const client = new OutreachClient(accessToken);
  const server = new McpServer({ name: "outreach-mcp-server", version: "1.0.0" });

  registerProspectTools(server, client);
  registerAccountTools(server, client);
  registerSequenceTools(server, client);
  registerTaskTools(server, client);
  registerUserTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("outreach-mcp-server ready on stdio");
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});
