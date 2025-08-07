import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import tools from "./tools";

export class MyMCP extends McpAgent {
    server = new McpServer({
        name: "Coffic MCP Server",
        version: "1.0.0",
    });

    async init() {
        // 获取API密钥
        const apiKey = (this.env as any).DASHSCOPE_API_KEY as string;

        // 计算器工具
        this.server.tool(tools.addTool.name, tools.addTool.schema, tools.addTool.handler);
        this.server.tool(tools.calculateTool.name, tools.calculateTool.schema, tools.calculateTool.handler);

        // 文本转图像工具
        this.server.tool(tools.text2imageTool.name,
            tools.text2imageTool.prompt,
            tools.text2imageTool.schema,
            tools.makeText2ImageHandler(apiKey)
        );
        this.server.tool(tools.text2imageStatusTool.name,
            tools.text2imageStatusTool.prompt,
            tools.text2imageStatusTool.schema,
            tools.makeText2ImageStatusHandler(apiKey)
        );
        this.server.tool(tools.text2imageModelsTool.name,
            tools.text2imageModelsTool.prompt,
            tools.text2imageModelsTool.schema,
            tools.text2imageModelsTool.handler
        );
    }
}   