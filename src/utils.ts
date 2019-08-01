export async function delay(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function throttler<R, A extends any[]>(
  interval: number,
  fn: (...args: A) => R,
  fnName: string,
  errorCatcher?: (error: Error, fnName?: string, args?: A) => void,
) {
  let then: number;
  let isRunning: boolean = false;

  if (!errorCatcher) {
    /* tslint:disable-next-line */
    errorCatcher = (error, fnName) => console.error(`[${fnName}] ${error.stack}`);
  }

  return async (...args: A): Promise<R> => {
    if (isRunning) {
      return;
    }

    const now = Date.now();
    if (then && !(now - then > interval)) {
      return;
    }
    then = now;

    isRunning = true;
    try {
      await fn(...args);
    } catch (error) {
      errorCatcher(error, fnName, args);
    }
    isRunning = false;
  };
}
