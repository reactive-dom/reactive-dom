import { Subscription } from 'rxjs';
import { Context, Control } from '@reactive-dom/api';

class DirectiveControl<TContext extends Context, TArgs extends unknown[]> {
    private readonly fn: (ctx: TContext, ...args: TArgs) => void | Subscription;
    private readonly args: TArgs;

    public constructor(fn: (ctx: TContext, ...args: TArgs) => void | Subscription, args: TArgs) {
        this.fn = fn;
        this.args = args;
    }

    public init(context: TContext): void {
        const sub = this.fn(context, ...this.args);

        if (sub) sub.add(context.onDetach(sub.unsubscribe.bind(sub)));
    }
}

/**
 * Directive. A function that returns a control.
 *
 * @typeParam   TContext - Returned control context type.
 * @typeParam   TArgs - Required arguments.
 */
export interface Directive<TContext extends Context, TArgs extends unknown[]> {
    (...args: TArgs): Control<TContext>;
}

/**
 * Creates a directive.
 *
 * Example:
 * ```ts
 * const setColor = directive((context: NodeRefContext, color: string) => {
 *     const { scheduler, nodeRef } = context.dom;
 *
 *     scheduler.schedule({
 *         queue: 'mutate',
 *         operation() {
 *             nodeRef.node.style.color = color;
 *         },
 *     });
 * });
 *
 * // Using the setColor directive.
 * c('p', { className: 'desc' }, setColor('red'))([
 *     'Hello World!'
 * ]);
 * ```
 *
 * @typeParam   TContext - Directive control context type.
 * @typeParam   TArgs - Directive function arguments.
 *
 * @param   fn - Directive execution function.
 *
 * @returns Directive.
 */
export function directive<TContext extends Context, TArgs extends unknown[]>(
    fn: (context: TContext, ...args: TArgs) => void | Subscription,
): Directive<TContext, TArgs> {
    return (...args: TArgs) => new DirectiveControl(fn, args);
}
