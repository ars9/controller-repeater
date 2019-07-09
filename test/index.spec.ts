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

    /* Wait for a tick */
    await delay(1);

    /* Expect value to be incremented by set payload */
    expect(t.counter).toEqual(11);
  });
});
