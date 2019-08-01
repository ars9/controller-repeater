import {
  ErrorCatcher,
  IRepeaterConfig,
  RepeaterTaskFunction,
  TaskName,
  TaskPayload,
} from './types';
import { throttler } from './utils';

export class RepeaterInstance {
  private heartbeatInterval: number;
  private tasks: Record<TaskName, { function: RepeaterTaskFunction; payload?: TaskPayload }>;
  private isBusy: boolean = false;
  private intervalId: number;
  private errorCatcher?: ErrorCatcher;
  private origin: any;

  constructor(data: IRepeaterConfig) {
    this.heartbeatInterval = data.heartbeatInterval || 100;
    this.tasks = {};
    this.errorCatcher = data.errorCatcher;
  }

  public setOrigin(origin: any) {
    this.origin = origin;
  }

  public start() {
    this.isBusy = true;
    setImmediate(async () => {
      await this.processTasks();
      this.isBusy = false;
    });

    this.intervalId = setInterval(async () => {
      if (!this.isBusy) {
        this.isBusy = true;
        await this.processTasks();
        this.isBusy = false;
      }
    }, this.heartbeatInterval) as any;
  }

  public stop() {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }

  public addTask(
    name: TaskName,
    task: RepeaterTaskFunction,
    interval?: number,
    payload?: TaskPayload,
  ) {
    if (this.tasks[name]) {
      throw new Error(`Task duplicate: ${name}`);
    }
    if (interval && interval < this.heartbeatInterval) {
      throw new Error(`Task interval can't be shorter than heartbeat interval`);
    }
    this.tasks[name] = {
      function: throttler(
        interval || 0,
        task.bind(this.origin),
        `${this.origin.constructor.name}.${task.name}`,
        this.errorCatcher,
      ),
      payload,
    };
    return this;
  }

  private async processTasks() {
    await Promise.all(
      Object.keys(this.tasks).map(async taskName => {
        const task = this.tasks[taskName];
        await task.function.apply(this.origin, task.payload);
      }),
    );
  }
}
