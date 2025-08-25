export interface TaskResult {
    orig_prompt: string;
    actual_prompt: string;
    url: string;
}

export interface TaskMetrics {
    TOTAL: number;
    SUCCEEDED: number;
    FAILED: number;
}

export interface TaskOutput {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
    submit_time: string;
    scheduled_time: string;
    end_time?: string;
    results: TaskResult[];
    task_metrics: TaskMetrics;
}

export interface TaskStatusResponse {
    request_id: string;
    output: TaskOutput;
    usage: {
        image_count: number;
    };
}

export interface DashScopeResponse {
    output: {
        task_id: string;
        task_status: string;
    };
    request_id: string;
}

export interface Text2ImageRequest {
    prompt: string;
    size?: string;
    n?: number;
    model?: string;
    dashScopeApiKey?: string;
}

export interface Text2ImageStatusRequest {
    task_id: string;
    dashScopeApiKey?: string;
}
