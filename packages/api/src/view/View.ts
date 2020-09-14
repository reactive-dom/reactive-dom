/**
 * Used to manipulate a view on the parent DOM tree.
 *
 * @typeParam   TChildNode - The type of child nodes that can be added to the View.
 * @typeParam   TNamespaceURI - The type of namespaceURI inherited from the parent DOM context.
 */
export interface View<TChildNode extends ChildNode = ChildNode, TNamespaceURI extends string = string> {
    /**
     * The top-level document object of the host element.
     */
    readonly ownerDocument: Document;

    /**
     * The namespace of the host element.
     */
    readonly namespaceURI: TNamespaceURI | null;

    /**
     * Inserts a node before the reference node.
     * If the reference node is null, the node is inserted at the end of the view.
     */
    readonly insertBefore: (newChild: TChildNode, refChild: TChildNode | null) => void;

    /**
     * Removes a child node from the view.
     */
    readonly removeChild: (oldChild: TChildNode) => void;

    /**
     * Replaces a view child node with another node.
     */
    readonly replaceChild: (newChild: TChildNode, oldChild: TChildNode) => void;

    /**
     * Returns the first child node in the view, or null if the view has no child.
     */
    readonly firstChild: ChildNode | null;

    /**
     * Returns the last child node in the view, or null if the view has no child.
     */
    readonly lastChild: ChildNode | null;
}
