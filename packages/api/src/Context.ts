/**
 * Subscription object returned when registering an onDetach handler on a Context.
 */
export interface Subscription {
    /**
     * Used to unsubscribe the register handler.
     */
    unsubscribe(): void;
}

/**
 * Context object that is passed to a Control on init.
 */
export interface Context {
    /**
     * Method used to register a handler function that is called when the context is detached.
     *
     * @remarks
     * If the handler is registered after the context has been detached the handler is called immediately.
     *
     * @param   handler - A handler function that is called when the context is detached.
     * @returns A Subscription object. Used to unsubscribe the registered handler function.
     */
    onDetach(handler: () => void): Subscription;
}
