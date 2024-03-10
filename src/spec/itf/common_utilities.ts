interface IMeasureTime {
  (action: () => void, actionName: string): () => void;
}

const measureTime: IMeasureTime = (action, actionName = "Action") => {
  return (): void => {
    const startTime = new Date();
    action();
    const endTime = new Date();
    const timeTaken = endTime.getTime() - startTime.getTime();
    console.warn(`${actionName} completed. Time taken: ${timeTaken} ms`);
  };
};

export { measureTime }
  