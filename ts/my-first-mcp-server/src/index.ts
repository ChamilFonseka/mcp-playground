import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "My simple MCP Server",
  version: "1.0.0",
  capabilities: {
    tools: {
      listChanged: true
    },
    resources: {
      listChanged: true
    },
    prompts: {
      listChanged: true
    }
  }
});

// Add an addition tool
server.tool(
  "add_two_numbers",
  "Adds two numbers together",
  { a: z.number(), b: z.number() },
  {
    destructiveHint: false,
    requiresContext: false,
    idempotentHint: true,
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

server.tool(
  "say_hello",
  "Say Hello",
  { name: z.string().optional() },
  {
    destructiveHint: false,
    requiresContext: false,
    idempotentHint: true,
  },
  async ({ name }) => {
    const res = `Hello, ${name || process.env.USERNAME || "stranger"}!`;
    return { content: [{ type: "text", text: res }] };
  }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);