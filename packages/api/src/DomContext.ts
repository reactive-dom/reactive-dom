import { Context } from './Context';
import { DomScheduler } from './dom-scheduler';

/**
 * Used to interact with the DOM. Provides a reference to the Document and the DOMScheduler.
 */
export interface DomContext extends Context {
    readonly dom: {
        /**
         * The entry point of the parent DOM tree.
         */
        readonly document: Document;
        /**
         * The scheduler used to queue DOM operations.
         */
        readonly scheduler: DomScheduler;
    };
}
