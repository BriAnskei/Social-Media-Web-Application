"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAllHandler = void 0;
async function resumeAll(req) {
    const relevantQueues = Array.from(req.queues.values()).filter((queue) => !queue.readOnlyMode);
    for (const queue of relevantQueues) {
        const isPaused = await queue.isPaused();
        if (isPaused) {
            await queue.resume();
        }
    }
    return { status: 200, body: { message: 'All queues resumed' } };
}
exports.resumeAllHandler = resumeAll;
//# sourceMappingURL=resumeAll.js.map