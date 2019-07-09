export type TaskName = string;
export type TaskPayload = any[];
export type RepeaterTaskFunction = (payload?: TaskPayload) => Promise<any>;
export type ErrorCatcher = (error: Error, fnName: string) => void;
export interface IRepeaterConfig {
  heartbeatInterval: number;
  tasks: RepeaterTaskFunction[];
  errorCatcher?: ErrorCatcher;
}
