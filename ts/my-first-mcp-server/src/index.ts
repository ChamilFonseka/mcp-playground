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
    const res = `Hello, ${name || process.env.NAME || "stranger"}!`;
    return { content: [{ type: "text", text: res }] };
  }
);

server.resource(
  "users",
  "users://all",
  {
    description: "Get all users",
    title: "Users",
    mimeType: "application/json",
  },
  async uri => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: "application/json",
        },
      ],
    }
  }
)

server.registerResource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  {
    title: "User Profile",
    description: "User profile information"
  },
  async (uri, { userId }) => {
    const profile = userProfiles.find(u => u.userId === userId);
    return {
      contents: [{
        uri: uri.href,
        text: `Profile data for user ${userId}: ${JSON.stringify(profile)}`,
        mimeType: "application/json"
      }]
    };
  }
);

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

const users = [
  {
    userId: "1",
    name: "Alice",
    age: 30
  },
  {
    userId: "2",
    name: "Bob",
    age: 25
  },
  {
    userId: "3",
    name: "Charlie",
    age: 35
  }
]

const userProfiles = [
  {
    userId: "1",
    bio: "Software Engineer from San Francisco",
    interests: ["Coding", "Music", "Travel"]
  },
  {
    userId: "2",
    bio: "Graphic Designer from New York",
    interests: ["Art", "Photography", "Reading"]
  },
  {
    userId: "3",
    bio: "Data Scientist from London",
    interests: ["AI", "Machine Learning", "Statistics"]
  }
]