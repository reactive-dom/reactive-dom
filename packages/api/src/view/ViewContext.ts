import { DomContext } from '../DomContext';
import { DomScheduler } from '../dom-scheduler';
import { View } from './View';

/**
 * Used to interact with the DOM. Provides View access to insert, replace, and remove nodes on the parent DOM tree.
 *
 * @typeParam   TChildNode - The type of node that can be added to the view.
 * @typeParam   TNamespaceURI - The default namespaceURI that is used when creating/adding a node on the View.
 */
export interface ViewContext<TChildNode extends ChildNode = ChildNode, TNamespaceURI extends string = string>
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
         * Used to manipulate a view on the parent DOM tree.
         */
        readonly view: View<TChildNode, TNamespaceURI>;
    };
}
