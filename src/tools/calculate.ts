import { z } from "zod";

// Calculator tool with multiple operations
export const calculateTool = {
    name: "calculate",
    schema: {
        operation: z.enum(["add", "subtract", "multiply", "divide"]),
        a: z.number(),
        b: z.number(),
    },
    handler: async ({ operation, a, b }: { operation: "add" | "subtract" | "multiply" | "divide"; a: number; b: number }) => {
        let result: number;
        switch (operation) {
            case "add":
                result = a + b;
                break;
            case "subtract":
                result = a - b;
                break;
            case "multiply":
                result = a * b;
                break;
            case "divide":
                if (b === 0)
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: "Error: Cannot divide by zero",
                            },
                        ],
                    };
                result = a / b;
                break;
        }
        return { content: [{ type: "text" as const, text: String(result) }] };
    },
}; 