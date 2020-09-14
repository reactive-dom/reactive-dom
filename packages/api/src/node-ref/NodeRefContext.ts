import { DomContext } from '../DomContext';
import { DomScheduler } from '../dom-scheduler';
import { NodeRef } from './NodeRef';

/**
 * Used to interact with the DOM. Provides a reference to a node on the parent DOM tree.
 *
 * @typeParam   TNode - The NodeRef node type.
 */
export interface NodeRefContext<TNode extends ChildNode = ChildNode> extends DomContext {
    readonly dom: {
        /**
         * The entry point of the parent DOM tree.
         */
        readonly document: Document;
        /**
         * The scheduler used to queue DOM operations.
         */
        readonly scheduler: DomScheduler;
        /**
         * Used to access a node in the parent DOM tree.
         */
        readonly nodeRef: NodeRef<TNode>;
    };
}
