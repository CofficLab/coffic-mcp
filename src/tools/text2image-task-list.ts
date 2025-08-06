import { z } from "zod";
import { scanAllTaskDirectories } from '@/utils/downloadImage';

export const text2imageTaskListTool = {
    name: "text2image_task_list",
    schema: {
        limit: z.number().optional().default(50),
        page: z.number().optional().default(1),
    },
    handler: async ({ limit, page }: { limit?: number; page?: number }) => {
        try {
            // 从任务目录扫描所有任务
            const taskData = await scanAllTaskDirectories();

            if (taskData.length === 0) {
                return {
                    content: [{
                        type: "text" as const,
                        text: "暂无任务记录"
                    }],
                };
            }

            // 按创建时间排序（最新的在前）
            taskData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const total = taskData.length;

            // 分页处理
            const startIndex = ((page || 1) - 1) * (limit || 50);
            const endIndex = startIndex + (limit || 50);
            const paginatedData = taskData.slice(startIndex, endIndex);

            // 为每个任务添加基础信息
            const enrichedData = paginatedData.map(task => ({
                ...task,
                createdDate: new Date(task.createdAt).toLocaleDateString('zh-CN'),
                createdTime: new Date(task.createdAt).toLocaleTimeString('zh-CN'),
                daysAgo: Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
                // 使用本地状态信息
                taskStatus: task.status || task.taskStatus?.task_status || 'UNKNOWN',
                submitTime: task.submitTime || task.taskStatus?.submit_time || '',
                endTime: task.endTime || task.taskStatus?.end_time || ''
            }));

            const taskListText = enrichedData.map(task =>
                `任务ID: ${task.taskId}\n提示词: ${task.prompt}\n状态: ${task.taskStatus}\n创建时间: ${task.createdDate} ${task.createdTime}\n---`
            ).join('\n');

            return {
                content: [{
                    type: "text" as const,
                    text: `任务列表 (第${page || 1}页，共${total}条记录):\n\n${taskListText}`
                }],
            };

        } catch (error) {
            console.error('查询任务列表时出错:', error);
            return {
                content: [{
                    type: "text" as const,
                    text: `查询任务列表失败: ${error instanceof Error ? error.message : '未知错误'}`
                }],
            };
        }
    },
}; 