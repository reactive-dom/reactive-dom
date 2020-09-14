/**
 * Task to be feed to the DomScheduler to be queued and executed.
 */
export interface Task {
    /**
     * Function to be executed by the DomScheduler.
     */
    readonly operation: () => void;

    /**
     * The name of the queue which the task is scheduled on.
     * Tasks on the same queue are executed sequentially in the same order they where dispatched.
     */
    readonly queue: 'mutate' | 'measure' | string;

    /**
     * Additional (optional) task related information.
     */
    readonly metadata?: { [key: string]: unknown };
}
