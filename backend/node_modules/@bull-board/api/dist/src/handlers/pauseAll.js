"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pauseAllHandler = void 0;
async function pauseAll(req) {
    const relevantQueues = Array.from(req.queues.values()).filter((queue) => !queue.readOnlyMode);
    for (const queue of relevantQueues) {
        const isPaused = await queue.isPaused();
        if (!isPaused) {
            await queue.pause();
        }
    }
    return { status: 200, body: { message: 'All queues paused' } };
}
exports.pauseAllHandler = pauseAll;
//# sourceMappingURL=pauseAll.js.map