import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { addTool, calculateTool, text2imageTool, text2imageStatusTool, text2imageTaskListTool, text2imageModelsTool } from "./tools";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Coffic MCP Server",
		version: "1.0.0",
	});

	async init() {
		// 计算器工具
		this.server.tool(addTool.name, addTool.schema, addTool.handler);
		this.server.tool(calculateTool.name, calculateTool.schema, calculateTool.handler);

		// 文本转图像工具
		this.server.tool(text2imageTool.name, text2imageTool.schema, text2imageTool.handler);
		this.server.tool(text2imageStatusTool.name, text2imageStatusTool.schema, text2imageStatusTool.handler);
		this.server.tool(text2imageModelsTool.name, text2imageModelsTool.schema, text2imageModelsTool.handler);
		this.server.tool(text2imageTaskListTool.name, text2imageTaskListTool.schema, text2imageTaskListTool.handler);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
