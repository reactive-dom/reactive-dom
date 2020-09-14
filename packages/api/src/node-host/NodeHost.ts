/**
 * Used to access, insert or remove a node on the parent DOM tree.
 *
 * @typeParam   TNode - The type of node that is accessed/written.
 * @typeParam   TNamespaceURI - The default namespaceURI type that is used when creating/writing a node.
 */
export interface NodeHost<TNode extends ChildNode = ChildNode, TNamespaceURI extends string = string> {
    /**
     * The namespaceURI inherited from parent DOM context.
     * Used as a default namespaceURI when creating DOM nodes.
     */
    readonly namespaceURI: TNamespaceURI | null;

    /**
     * The current child node attached to the parent DOM tree.
     */
    readonly node: ChildNode | null;

    /**
     * Appends child node, or replaces existing child node.
     *
     * @param   node - Node to be inserted or replaced with.
     */
    write(node: TNode): void;

    /**
     * Removes existing child node.
     */
    remove(): void;
}
