import { Context } from '@reactive-dom/api';

/**
 * Subscription object returned when registering an onDetach handler.
 * Used to unsubscribe the registered onDetach handler.
 */
class OnDetachSubscription {
    private readonly detachable: Detachable;
    private readonly handler: () => void;
    public constructor(detachable: Detachable, handler: () => void, signal?: AbortSignal) {
        this.detachable = detachable;
        this.handler = handler;

        signal?.addEventListener('abort', this.unsubscribe.bind(this));
    }

    /**
     * Removes the register handler on the Detachable.
     */
    public unsubscribe(): void {
        if (this.detachable._handlers) {
            this.detachable._handlers.delete(this.handler);
        }
    }
}

/**
 * Class used to create a detachable Context object.
 *
 * @internal
 */
export class Detachable implements Context {
    public _handlers: Set<() => void> | null = new Set();

    public onDetach(handler: () => void, signal?: AbortSignal): { unsubscribe: () => void } {
        if (this._handlers) this._handlers.add(handler);
        else handler();

        return new OnDetachSubscription(this, handler, signal);
    }

    /**
     * Calls all the registered onDetach handlers.
     *
     * @internal
     */
    public detach(): void {
        if (this._handlers) {
            for (const handler of this._handlers) handler();
        }
        this._handlers = null;
    }

    /**
     * True if detach() has been called.
     */
    public get detached(): boolean {
        return this._handlers !== null;
    }
}
