export const errorLog = (functionName: string, error: Error) => {
  console.error(`${functionName}, ${error as Error}}`);
};
