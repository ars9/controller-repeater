export async function delay(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function throttler<R, A extends any[]>(
  interval: number,
  fn: (...args: A) => R,
  fnName: string,
  errorCatcher: (error: Error, fnName?: string, args?: A) => void,
) {
  let then: number;
  let isRunning: boolean = false;

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
      await errorCatcher(error, fnName, args);
    }
    isRunning = false;
  };
}
