export const InvalidRequest = "invalid request";
export const ServerIssue = "internal error";
export class ServerIssueError extends Error {
    constructor(message) {
        super(message, { cause: ServerIssue });
    }
}
export class InvalidRequestError extends Error {
    constructor(message) {
        super(message, { cause: InvalidRequest });
    }
}
export class InvalidFilePathError extends InvalidRequestError {
    constructor() {
        super("Invalid filepath given");
    }
}
export function ok(val) {
    return { ok: true, val };
}
export function fail(msg) {
    return { ok: false, err: msg };
}
export function assertEnvVariableDefined(name, val) {
    if (val === undefined || val === null) {
        throw new Error(`No ${name} found in environment variables`);
    }
}
export function isInvalidFilePath(path) {
    const validPathRegex = /^[a-zA-Z0-9_.\-/]+$/;
    return !path || !validPathRegex.test(path);
}
//# sourceMappingURL=errors.js.map