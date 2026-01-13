export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    timestamp: string;
    meta?: ResponseMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    stack?: string;
}
export interface ResponseMeta {
    requestId?: string;
    duration?: number;
    version?: string;
    [key: string]: any;
}
export interface SuccessResponse<T = any> extends ApiResponse<T> {
    success: true;
    data: T;
}
export interface ErrorResponse extends ApiResponse<never> {
    success: false;
    error: ApiError;
}
export interface BatchOperationResult<T = any> {
    succeeded: T[];
    failed: BatchOperationError[];
    totalProcessed: number;
    successCount: number;
    failureCount: number;
}
export interface BatchOperationError {
    item: any;
    error: ApiError;
}
