import { DomContext } from '../DomContext';
import { DomScheduler } from '../dom-scheduler';
import { NodeHost } from './NodeHost';

/**
 * Used to interact with the DOM. Provides NodeHost access to read and write a node on the parent DOM tree.
 *
 * @typeParam   TNode - The nodeHost node type.
 * @typeParam   TNamespaceURI - The nodeHost namespaceURI type.
 */
export interface NodeHostContext<TNode extends ChildNode = ChildNode, TNamespaceURI extends string = string>
    extends DomContext {
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
         * Used to access, insert or remove a node in the parent DOM tree.
         */
        readonly nodeHost: NodeHost<TNode, TNamespaceURI>;
    };
}
