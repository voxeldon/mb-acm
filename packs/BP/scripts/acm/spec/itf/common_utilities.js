const measureTime = (action, actionName = "Action") => {
    return () => {
        const startTime = new Date();
        action();
        const endTime = new Date();
        const timeTaken = endTime.getTime() - startTime.getTime();
        console.warn(`${actionName} completed. Time taken: ${timeTaken} ms`);
    };
};
export { measureTime };
