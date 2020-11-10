/* eslint-disable @typescript-eslint/no-empty-interface */
import { ViewContext, NodeHostContext, NodeRefContext, Control } from '@reactive-dom/api';

/**
 * Control used to manage a ChildNode in the parent DOM tree.
 *
 * @typeParam   TChildNode - ChildNode type.
 */
export interface NodeRefControl<TChildNode extends ChildNode = ChildNode> extends Control<NodeRefContext<TChildNode>> {}

/**
 * Control used to manage a View in the parent DOM tree.
 *
 * @typeParam   TChildNode - ChildNode type.
 * @typeParam   TNamespaceURI - The namespaceURI of the parent view/element.
 */
export interface ViewControl<TChildNode extends ChildNode = ChildNode, TNamespaceURI extends string = string>
    extends Control<ViewContext<TChildNode, TNamespaceURI>> {}

/**
 * Control used to append/remove a ChildNode in the parent DOM tree.
 *
 * @typeParam   TChildNode - ChildNode type.
 * @typeParam   TNamespaceURI - The namespaceURI of the parent view/element.
 */
export interface NodeHostControl<TChildNode extends ChildNode = ChildNode, TNamespaceURI extends string = string>
    extends Control<NodeHostContext<TChildNode, TNamespaceURI>> {}
