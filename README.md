# controller-repeater

## A decorator set to automatically call class methods with an interval

`@Repeater` class decorator sets up a loop (via `setInterval`) with a heartbeat interval (default: 100ms). On every heartbeat it executes every method marked by a `@RepeaterTask`. Particular tasks can be limited by minimum time intervals between them (this interval can't be lesser than the heartbeat interval). A task will not be executed again until previous call is finished.

Note: tasks are also run immediately at the next process tick (via `setImmediate`) before loop start.

### Decorators

- `@Repeater` is attached to a class.

```typescript
export function Repeater(options?: {
  heartbeatInterval?: number;
  errorCatcher?: ErrorCatcher;
}): ClassDecorator;
```

- `@RepeaterTask` is attached to a class method.

```typescript
export function RepeaterTask(payload?: TaskPayload): PropertyDecorator;
export function RepeaterTask(interval: number, payload?: TaskPayload): PropertyDecorator;
```

### Basic example

```typescript
@Repeater()
class Test1 {
  public counter = 0;

  @RepeaterTask()
  public increment() {
    this.counter++;
  }
}

const t = new Test1();

// wait...

console.log(t.counter); // 1
```
