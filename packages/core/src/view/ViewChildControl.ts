import { Control, NodeHostContext, ViewContext } from '@reactive-dom/api';

/**
 * View child control type.
 *
 * @typeParam   TChildNode - The control child nodes type.
 * @typeParam   TNamespaceURI - The control default NamespaceURI type.
 */
export type ViewChildControl<TNode extends ChildNode, TNamespaceURI extends string = string> =
    | Control<ViewContext<TNode, TNamespaceURI>>
    | Control<NodeHostContext<TNode, TNamespaceURI>>;
