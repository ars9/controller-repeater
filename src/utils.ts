export async function delay(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function throttler<R, A extends any[]>(
  interval: number,
  fn: (...args: A) => R,
  errorCatcher?: (error: Error, fnName?: string, args?: A) => void,
) {
  let then: number;
  let isRunning: boolean = false;
  return (...args: A): R => {
    if (isRunning) {
      return;
    }
    const now = Date.now();
    if (!then || now - then > interval) {
      isRunning = true;
      then = now;
      if (errorCatcher) {
        try {
          const result = fn(...args);
          if (result instanceof Promise) {
            result.catch(error => errorCatcher(error, fn.name, args));
            result.finally(() => (isRunning = false));
          } else {
            isRunning = false;
          }
          return result;
        } catch (error) {
          errorCatcher(error, fn.name, args);
          isRunning = false;
        }
      } else {
        const result = fn(...args);
        if (result instanceof Promise) {
          result.finally(() => {
            isRunning = false;
          });
        } else {
          isRunning = false;
        }
        return result;
      }
    }
  };
}
