# Coffic MCP

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=Coffic&config=eyJjb21tYW5kIjoibnB4IG1jcC1yZW1vdGUgaHR0cHM6Ly9tY3AuY29mZmljLmNuL3NzZSJ9)

## 环境变量配置

### 生产环境配置（推荐）

对于生产环境部署，使用 Wrangler CLI 安全存储环境变量：

```bash
# 设置环境变量（加密存储）
wrangler secret put DASHSCOPE_API_KEY

# 查看所有密钥
wrangler secret list

# 部署到Cloudflare Workers
wrangler deploy
```

### 本地开发配置

对于本地开发，在`wrangler.jsonc`中添加变量：

```json
{
  "vars": {
    "DASHSCOPE_API_KEY": "your-api-key-here"
  }
}
```

### 代码中使用

在 TypeScript 代码中访问环境变量：

```typescript
// 在工具处理函数中
const apiKey = env.DASHSCOPE_API_KEY;

// 在 fetch 处理函数中
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const apiKey = env.DASHSCOPE_API_KEY;
    // ...
  },
};
```
