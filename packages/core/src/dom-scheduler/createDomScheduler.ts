import { DomScheduler, Task } from '@reactive-dom/api';

function taskQueueRunner(taskQueue: Task[]): void {
    for (const task of taskQueue) {
        try {
            task.operation();
        } catch (e) {
            console.error('Task execution error: ', e);
        }
    }
}

class BrowserDomScheduler implements DomScheduler {
    private queues = new Map<string, Task[]>();
    private isFlushScheduled = false;

    public runningQueue: string | null = null;

    public constructor() {
        this.resetQueues();
    }

    private resetQueues(): void {
        this.queues.clear();

        // Known queues are predefined so they are always executed first and in order.
        this.queues.set('mutate', []);
        this.queues.set('measure', []);
    }

    private flush(): void {
        this.isFlushScheduled = false;

        const queues = Array.from(this.queues.entries());
        this.resetQueues();

        for (let queue of queues) {
            const [queueName, tasks] = queue;
            this.runningQueue = queueName;
            taskQueueRunner(tasks);
        }

        this.runningQueue = null;
    }

    public schedule(task: Task): void {
        // Add task to queue
        const queue = this.queues.get(task.queue);
        if (queue) queue.push(task);
        else this.queues.set(task.queue, [task]);

        if (!this.isFlushScheduled) {
            this.isFlushScheduled = true;
            requestAnimationFrame(this.flush.bind(this));
        }
    }
}

/**
 * Creates a DomScheduler optimized for the browser.
 */
export function createDomScheduler(): DomScheduler {
    return new BrowserDomScheduler();
}
