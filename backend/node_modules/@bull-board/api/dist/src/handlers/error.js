"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error) {
    return {
        status: error.statusCode || 500,
        body: {
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
    };
}
//# sourceMappingURL=error.js.map