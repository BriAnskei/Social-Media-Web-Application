export const errorLog = (functionName: string, error: Error) => {
  console.error(`${functionName}, ${error as Error}}`);
};

export const errThrower = (functionName: string, err: Error): never => {
  throw new Error(`${functionName}: ${err.message}\n${err.stack}`);
};
