import { Repeater, RepeaterTask } from '../src';
import { delay } from '../src/utils';

/* tslint:disable:max-classes-per-file */

const TIME_MARGIN = 0.99;

describe('controller-repeater', () => {
  it('should work with default values', async () => {
    @Repeater()
    class Test1 {
      public counter = 0;

      @RepeaterTask()
      public increment() {
        this.counter++;
      }
    }

    const t = new Test1();
    expect(t.counter).toEqual(0);
    t.increment();

    /* Make sure taht direct method call works */
    expect(t.counter).toEqual(1);

    /* Expect method to be called immediately on the next process tick */
    await delay(0);
    expect(t.counter).toEqual(2);

    /* Wait for 10 cycles (100ms heartbeat default) */
    await delay(1000 * TIME_MARGIN);

    /* Expect method to be called for 10 more times */
    expect(t.counter).toEqual(11);
  });

  it('should work with custom heartbeat', async () => {
    const HEARTBEAT = 150;

    @Repeater({ heartbeatInterval: HEARTBEAT })
    class Test2 {
      public counter = 0;

      @RepeaterTask()
      public increment() {
        this.counter++;
      }
    }

    const t = new Test2();
    expect(t.counter).toEqual(0);

    /* Wait for 10 heartbeats with some margin */
    await delay(10 * HEARTBEAT * TIME_MARGIN);

    expect(t.counter).toEqual(10);
  });

  it('should work with custom task interval', async () => {
    const INTERVAL = 500;

    @Repeater()
    class Test3 {
      public counter = 0;

      @RepeaterTask(INTERVAL)
      public increment() {
        this.counter++;
      }
    }

    const t = new Test3();
    expect(t.counter).toEqual(0);

    /* Wait for a few cycles */
    await delay(1000);

    expect(t.counter).toEqual(1000 / INTERVAL);
  });

  it('should pass argument payload to a task', async () => {
    @Repeater()
    class Test4 {
      public counter = 0;

      @RepeaterTask([10])
      public increment(value: number) {
        this.counter += value;
      }
    }

    const t = new Test4();
    expect(t.counter).toEqual(0);

    /* Make sure it works with a direct call */
    t.increment(1);
    expect(t.counter).toEqual(1);

    /* Wait for execution */
    await delay(10);

    /* Expect value to be incremented by set payload */
    expect(t.counter).toEqual(11);
  });

  it('should work with multiple object instances', async () => {
    @Repeater()
    class Test5 {
      public counter = 0;

      @RepeaterTask()
      public increment() {
        this.counter++;
      }
    }

    const t1 = new Test5();
    const t2 = new Test5();
  });

  it('should not execute task if it is still running', async () => {
    @Repeater()
    class Test6 {
      public counter = 0;

      @RepeaterTask()
      public async increment() {
        this.counter++;
        await delay(1000);
      }
    }

    const t = new Test6();
    expect(t.counter).toEqual(0);

    await delay(1000);

    expect(t.counter).toEqual(1);
  });

  it('should output exception stack to console if catcher is not set up (sync method)', async () => {
    @Repeater()
    class Test7 {
      public counter = 0;

      @RepeaterTask()
      public increment() {
        this.counter++;
        throw new Error('oops');
      }
    }

    const consoleSpy = jest.spyOn(console, 'error');

    /* Intercept message in console.error */
    let errorMessage;
    consoleSpy.mockImplementation(message => (errorMessage = message));

    const t = new Test7();
    expect(t.counter).toEqual(0);

    /* Wait for execution */
    await delay(10);

    /* Expect to have an error console output */
    expect(consoleSpy).toBeCalledTimes(1);

    /* Expect that error message is mentioned in output */
    expect(errorMessage).toContain(`oops`);

    /* Expect that called method is mentioned in output */
    expect(errorMessage).toContain(`Test7.increment`);

    consoleSpy.mockRestore();
  });

  it('should output exception stack to console if catcher is not set up (async method)', async () => {
    @Repeater()
    class Test7 {
      public counter = 0;

      @RepeaterTask()
      public async increment() {
        await delay(1);
        this.counter++;
        throw new Error('oops');
      }
    }

    const consoleSpy = jest.spyOn(console, 'error');

    /* Intercept message in console.error */
    let errorMessage;
    consoleSpy.mockImplementation(message => (errorMessage = message));

    const t = new Test7();
    expect(t.counter).toEqual(0);

    /* Wait for execution */
    await delay(10);

    /* Expect to have an error console output */
    expect(consoleSpy).toBeCalledTimes(1);

    /* Expect that error message is mentioned in output */
    expect(errorMessage).toContain(`oops`);

    /* Expect that called method is mentioned in output */
    expect(errorMessage).toContain(`Test7.increment`);

    consoleSpy.mockRestore();
  });

  it('should correctly use supplemented error catcher', async () => {
    @Repeater({
      errorCatcher() {
        this.errors++;
      },
    })
    class Test8 {
      public counter = 0;
      public errors = 0;

      @RepeaterTask()
      public increment() {
        this.counter++;
        throw new Error('oops');
      }
    }

    const t = new Test8();
    expect(t.counter).toEqual(0);

    /* Wait for execution */
    await delay(10);

    /* Expect to have task been called */
    expect(t.counter).toBe(1);

    /* Expect error counter to be incremented */
    expect(t.errors).toBe(1);
  });
});
