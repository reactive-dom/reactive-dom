import { Observable, Subscriber, OperatorFunction } from 'rxjs';
import { Context } from '@reactive-dom/api';

function whileAttachedObserverFunction<T>(this: [Context, Observable<T>], observer: Subscriber<T>): void {
    const subscription = this[1].subscribe(observer);
    observer.add(subscription);
    observer.add(this[0].onDetach(observer.complete.bind(observer)));
}

function untilDetachFunction<T>(this: Context, source: Observable<T>): Observable<T> {
    return new Observable<T>(whileAttachedObserverFunction.bind([this, source]));
}

/**
 * Emits the values emitted by the source Observable until `context` is detached. Then, it completes.
 *
 * @typeParam   T - Emission type.
 *
 * @param   context - Context used as notifier to complete subscription on detach.
 *
 * @returns OperatorFunction
 */
export function untilDetach<T>(context: Context): OperatorFunction<T, T> {
    return untilDetachFunction.bind(context) as OperatorFunction<T, T>;
}
