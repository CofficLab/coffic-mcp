import { z } from "zod";

// Simple addition tool
export const addTool = {
    name: "add",
    schema: { a: z.number(), b: z.number() },
    handler: async ({ a, b }: { a: number; b: number }) => ({
        content: [{ type: "text" as const, text: String(a + b) }],
    }),
}; 