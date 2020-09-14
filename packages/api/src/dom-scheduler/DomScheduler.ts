import { Task } from './Task';

/**
 * Used to schedule DOM tasks.
 */
export interface DomScheduler {
    /**
     * Method to schedule a Task to be executed.
     */
    schedule(task: Task): void;

    /**
     * Name of the queue being executed. Null if no queue is executing.
     */
    readonly runningQueue: string | null;
}
