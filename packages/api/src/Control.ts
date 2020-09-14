import { Context } from './Context';

/**
 * Interface used to pass control of a Context.
 *
 * @typeParam   TContext - The type of Context supplied to the Control on init.
 */
export interface Control<TContext extends Context> {
    /**
     * Used to initiate control over the provided Context.
     *
     * @param   context - The Context object.
     */
    init(context: TContext): void;
}
