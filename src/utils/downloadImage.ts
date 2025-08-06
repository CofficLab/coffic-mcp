import { writeFile, access, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * 下载图片并保存到本地
 * @param imageUrl 图片URL
 * @param taskId 任务ID
 * @param index 图片索引
 * @returns 相对路径（相对于项目根目录）
 */
export async function downloadImage(imageUrl: string, taskId: string, index: number = 0): Promise<string> {
    try {
        // 创建assets目录结构
        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');
        const taskDir = join(assetsDir, taskId);

        // 确保目录存在
        if (!existsSync(assetsDir)) {
            await mkdir(assetsDir, { recursive: true });
        }
        if (!existsSync(taskDir)) {
            await mkdir(taskDir, { recursive: true });
        }

        // 生成文件名
        const fileName = `image_${index + 1}.png`;
        const localPath = join(taskDir, fileName);
        const relativePath = `src/assets/generated-images/${taskId}/${fileName}`;

        // 检查文件是否已存在
        if (existsSync(localPath)) {
            console.log(`图片已存在，跳过下载: ${relativePath}`);
            return relativePath;
        }

        // 下载图片
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        await writeFile(localPath, new Uint8Array(buffer));

        console.log(`图片已下载到: ${relativePath}`);
        return relativePath;

    } catch (error) {
        console.error('下载图片时出错:', error);
        throw error;
    }
}

/**
 * 更新任务数据，保存图片信息到任务目录
 * @param taskId 任务ID
 * @param taskStatus 任务状态数据
 */
export async function updateTaskWithImages(taskId: string, taskStatus: any): Promise<void> {
    try {
        const { join } = await import('path');
        const { writeFile, access, readFile } = await import('fs/promises');

        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');
        const taskDir = join(assetsDir, taskId);
        const taskInfoPath = join(taskDir, 'task-info.json');

        // 尝试读取现有的任务信息
        let existingTaskInfo = null;
        try {
            const existingContent = await readFile(taskInfoPath, 'utf-8');
            existingTaskInfo = JSON.parse(existingContent);
            console.log(`读取现有任务信息: ${taskId}`);
        } catch (error) {
            // 文件不存在，创建新的任务信息
            console.log(`创建新任务信息: ${taskId}`);
        }

        // 创建或更新任务信息
        const taskInfo: any = {
            taskId: taskId,
            prompt: taskStatus.output?.results?.[0]?.orig_prompt || existingTaskInfo?.prompt || '未知提示词',
            createdAt: existingTaskInfo?.createdAt || new Date().toISOString(),
            status: taskStatus.output?.task_status || existingTaskInfo?.status || 'unknown',
            submitTime: taskStatus.output?.submit_time || existingTaskInfo?.submitTime,
            endTime: taskStatus.output?.end_time || existingTaskInfo?.endTime,
            images: existingTaskInfo?.images || [],
            taskStatus: taskStatus.output
        };

        // 如果任务成功，下载图片
        if (taskStatus.output?.task_status === 'SUCCEEDED' && taskStatus.output?.results) {
            // 检查现有图片是否已经下载
            const existingImages = existingTaskInfo?.images || [];
            taskInfo.images = [];

            for (let i = 0; i < taskStatus.output.results.length; i++) {
                const result = taskStatus.output.results[i];

                // 检查是否已经有对应的本地图片
                const existingImage = existingImages.find((img: any) =>
                    img.orig_prompt === result.orig_prompt &&
                    img.actual_prompt === result.actual_prompt
                );

                if (existingImage && existingImage.localPath) {
                    // 检查本地文件是否存在
                    const { join } = await import('path');
                    const localFilePath = join(process.cwd(), existingImage.localPath);

                    if (existsSync(localFilePath)) {
                        console.log(`图片已存在，跳过下载: ${existingImage.localPath}`);
                        taskInfo.images.push(existingImage);
                        continue;
                    }
                }

                // 下载新图片
                try {
                    const localPath = await downloadImage(result.url, taskId, i);
                    taskInfo.images.push({
                        url: result.url,
                        localPath: localPath,
                        orig_prompt: result.orig_prompt,
                        actual_prompt: result.actual_prompt
                    });
                } catch (error) {
                    console.error(`下载图片 ${i + 1} 失败:`, error);
                    // 即使下载失败，也保存URL信息
                    taskInfo.images.push({
                        url: result.url,
                        orig_prompt: result.orig_prompt,
                        actual_prompt: result.actual_prompt
                    });
                }
            }
        }

        // 比较新旧任务信息，只有在有变化时才更新文件
        if (existingTaskInfo) {
            const hasChanges = compareTaskInfo(existingTaskInfo, taskInfo);
            if (!hasChanges) {
                console.log(`任务 ${taskId} 信息无变化，跳过文件更新`);
                return;
            }
        }

        // 保存任务信息到任务目录
        await saveTaskInfoToDirectory(taskId, taskInfo);
        console.log(`任务 ${taskId} 数据已更新`);

    } catch (error) {
        console.error('更新任务数据时出错:', error);
    }
}

/**
 * 比较两个任务信息是否有变化
 * @param oldInfo 旧的任务信息
 * @param newInfo 新的任务信息
 * @returns 是否有变化
 */
function compareTaskInfo(oldInfo: any, newInfo: any): boolean {
    // 比较关键字段
    if (oldInfo.status !== newInfo.status) {
        console.log(`状态变化: ${oldInfo.status} -> ${newInfo.status}`);
        return true;
    }

    if (oldInfo.submitTime !== newInfo.submitTime) {
        console.log(`提交时间变化: ${oldInfo.submitTime} -> ${newInfo.submitTime}`);
        return true;
    }

    if (oldInfo.endTime !== newInfo.endTime) {
        console.log(`结束时间变化: ${oldInfo.endTime} -> ${newInfo.endTime}`);
        return true;
    }

    // 比较图片数量
    if (oldInfo.images?.length !== newInfo.images?.length) {
        console.log(`图片数量变化: ${oldInfo.images?.length || 0} -> ${newInfo.images?.length || 0}`);
        return true;
    }

    // 比较图片内容
    if (oldInfo.images && newInfo.images) {
        for (let i = 0; i < Math.max(oldInfo.images.length, newInfo.images.length); i++) {
            const oldImage = oldInfo.images[i];
            const newImage = newInfo.images[i];

            if (!oldImage || !newImage) {
                console.log(`图片 ${i + 1} 存在性变化`);
                return true;
            }

            if (oldImage.url !== newImage.url ||
                oldImage.localPath !== newImage.localPath ||
                oldImage.orig_prompt !== newImage.orig_prompt ||
                oldImage.actual_prompt !== newImage.actual_prompt) {
                console.log(`图片 ${i + 1} 内容变化`);
                return true;
            }
        }
    }

    // 比较任务状态详情
    if (oldInfo.taskStatus?.task_status !== newInfo.taskStatus?.task_status) {
        console.log(`任务状态详情变化: ${oldInfo.taskStatus?.task_status} -> ${newInfo.taskStatus?.task_status}`);
        return true;
    }

    return false;
}

/**
 * 在任务目录下保存任务信息JSON文件
 * @param taskId 任务ID
 * @param taskInfo 任务信息
 */
async function saveTaskInfoToDirectory(taskId: string, taskInfo: any): Promise<void> {
    try {
        const { join } = await import('path');
        const { writeFile } = await import('fs/promises');

        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');
        const taskDir = join(assetsDir, taskId);
        const taskInfoPath = join(taskDir, 'task-info.json');

        // 确保任务目录存在
        if (!existsSync(taskDir)) {
            await mkdir(taskDir, { recursive: true });
        }

        // 保存任务信息
        await writeFile(taskInfoPath, JSON.stringify(taskInfo, null, 2), 'utf-8');
        console.log(`任务信息已保存到: ${taskInfoPath}`);

    } catch (error) {
        console.error('保存任务信息到目录失败:', error);
    }
}

/**
 * 从任务目录读取任务信息
 * @param taskId 任务ID
 * @returns 任务信息或null
 */
export async function readTaskInfoFromDirectory(taskId: string): Promise<any | null> {
    try {
        const { join } = await import('path');
        const { readFile, access } = await import('fs/promises');

        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');
        const taskDir = join(assetsDir, taskId);
        const taskInfoPath = join(taskDir, 'task-info.json');

        // 检查文件是否存在
        try {
            await access(taskInfoPath);
        } catch (error) {
            return null;
        }

        // 读取任务信息
        const fileContent = await readFile(taskInfoPath, 'utf-8');
        const taskInfo = JSON.parse(fileContent);

        console.log(`从目录读取任务信息: ${taskId}`);
        return taskInfo;

    } catch (error) {
        console.error('从目录读取任务信息失败:', error);
        return null;
    }
}

/**
 * 扫描所有任务目录，恢复任务信息
 * @returns 所有任务信息数组
 */
export async function scanAllTaskDirectories(): Promise<any[]> {
    try {
        const { join } = await import('path');
        const { readdir, stat } = await import('fs/promises');

        const assetsDir = join(process.cwd(), 'src', 'assets', 'generated-images');

        // 检查目录是否存在
        try {
            await stat(assetsDir);
        } catch (error) {
            return [];
        }

        const taskDirs = await readdir(assetsDir);
        const allTasks = [];

        for (const taskDir of taskDirs) {
            const taskInfo = await readTaskInfoFromDirectory(taskDir);
            if (taskInfo) {
                allTasks.push(taskInfo);
            }
        }

        console.log(`扫描到 ${allTasks.length} 个任务目录`);
        return allTasks;

    } catch (error) {
        console.error('扫描任务目录失败:', error);
        return [];
    }
} 