import { EventEmitter } from "events";
export const appEvents = new EventEmitter();

// Optional: Increase max listeners to prevent memory leak warnings
// if you have many listeners
// The default is 10 listeners per event
appEvents.setMaxListeners(20);
