/*
 * Normalized error shape for every failure that can come out of apiRequest:
 * HTTP errors (with status + optional field errors) and network failures.
 */
export class ApiError extends Error {

    constructor(message, {
        status = 0,
        errors = null
    } = {}) {

        super(message);

        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }

    get isNetworkError() {
        return this.status === 0;
    }

    get isUnauthorized() {
        return this.status === 401;
    }
}
