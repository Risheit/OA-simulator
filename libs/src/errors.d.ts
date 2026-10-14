export declare const InvalidRequest = "invalid request";
export declare const ServerIssue = "internal error";
export declare class ServerIssueError extends Error {
    constructor(message: string);
}
export declare class InvalidRequestError extends Error {
    constructor(message: string);
}
export declare class InvalidFilePathError extends InvalidRequestError {
    constructor();
}
export type Result<T> = {
    ok: true;
    val: T;
} | {
    ok: false;
    err: string;
};
export declare function ok<T>(val: T): Result<T>;
export declare function ok(): Result<void>;
export declare function fail<T>(msg: string): Result<T>;
export declare function assertEnvVariableDefined(name: string, val: unknown): void;
export declare function isInvalidFilePath(path: string): boolean;
//# sourceMappingURL=errors.d.ts.map