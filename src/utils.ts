export async function delay(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function throttler<R, A extends any[]>(
  interval: number,
  fn: (...args: A) => R,
  errorCatcher?: (error: Error, fnName?: string, args?: A) => void,
) {
  let then: number;
  return (...args: A): R => {
    const now = Date.now();
    if (!then || now - then > interval) {
      then = now;
      if (errorCatcher) {
        try {
          const result = fn(...args);
          if (result instanceof Promise) {
            result.catch(error => errorCatcher(error, fn.name, args));
          }
          return result;
        } catch (error) {
          errorCatcher(error, fn.name, args);
        }
      } else {
        return fn(...args);
      }
    }
  };
}
