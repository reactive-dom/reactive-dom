import { PartialObserver } from 'rxjs';

/**
 * Used to receive data from an Observable, and is supplied as an argument to subscribe.
 *
 * @remarks
 * The Observer type is a direct reference of the PartialObserver type from rxjs.
 *
 * @typeParam   T - The type of value received by the `next` function.
 *
 * @internal
 */
export type Observer<T> = PartialObserver<T>;

/**
 * Subscription object returned on subscribing to Observable.
 */
export interface Subscription {
    /**
     * Used to unsubscribe the registered Observer.
     */
    unsubscribe(): void;
}

/**
 * Subscribable interface required internally.
 *
 * @typeParam   T - The Observable emission value type.
 *
 * @internal
 */
export interface Subscribable<T> {
    subscribe(observer: Observer<T>): Subscription;
}

/**
 * Checks if a value is an Observable type.
 *
 * @typeParam   T - The Observable emission value type.
 *
 * @param   value - Value to check.
 *
 * @returns Boolean. True if value is Observable, false if not.
 *
 * @internal
 */
export function isSubscribable<T>(value: unknown): value is Subscribable<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!value && typeof (value as any).subscribe === 'function';
}
