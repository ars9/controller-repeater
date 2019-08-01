export type TaskName = string;
export type TaskPayload = any[];
export type RepeaterTaskFunction = (payload?: TaskPayload) => Promise<any>;
export type ErrorCatcherSync = (error: Error, fnName: string) => void;
export type ErrorCatcherAsync = (error: Error, fnName: string) => Promise<void>;
export interface IRepeaterConfig {
  heartbeatInterval: number;
  tasks: RepeaterTaskFunction[];
  errorCatcher?: ErrorCatcherSync | ErrorCatcherAsync;
}
