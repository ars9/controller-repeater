import { RepeaterInstance } from './instance';
import { ErrorCatcher, IRepeaterConfig, TaskPayload } from './types';

const TASKMASTER_TASKS = '__taskmaster_tasks';

export function Repeater(options?: {
  heartbeatInterval?: number;
  errorCatcher?: ErrorCatcher;
}): ClassDecorator {
  if (!options) {
    options = {};
  }
  const data: IRepeaterConfig = {
    errorCatcher: options.errorCatcher,
    heartbeatInterval: options.heartbeatInterval,
    tasks: [],
  };
  return target => {
    const taskmaster = new RepeaterInstance(data);

    /* Extend class prototype to start taskmaster in constructor */
    return class extends target.prototype.constructor {
      constructor(...args: any[]) {
        super(...args);
        taskmaster.start();
        taskmaster.setOrigin(this);

        /* Add tasks defined by @Task and stored in prototype */
        const tasks = target.prototype[TASKMASTER_TASKS];
        if (tasks) {
          for (const taskName of Object.keys(tasks)) {
            const task = tasks[taskName];
            taskmaster.addTask(taskName, task.function, task.interval, task.payload || []);
          }
        }
      }
      get taskmaster() {
        return taskmaster;
      }
    } as any;
  };
}

export function RepeaterTask(payload?: TaskPayload): PropertyDecorator;
export function RepeaterTask(interval: number, payload?: TaskPayload): PropertyDecorator;
export function RepeaterTask(first?: any, second?: any): any {
  const interval = typeof first === 'number' ? first : 0;
  const payload = typeof first === 'object' ? first : second;
  if (payload && !Array.isArray(payload)) {
    throw new Error(`Task payload must be an array of arguments`);
  }
  return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
    const proto = target.constructor.prototype;

    if (!proto[TASKMASTER_TASKS]) {
      proto[TASKMASTER_TASKS] = {};
    }

    proto[TASKMASTER_TASKS][propertyKey] = {
      function: propertyDescriptor.value,
      interval,
      payload,
    };
  };
}
