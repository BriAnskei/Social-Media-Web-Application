export function getErrDelayjson() {
  return {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 200,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  };
}
