/**
 * Used to reference a child node on the parent DOM tree.
 *
 * @typeParam   TNode - The type of the reference child node.
 */
export interface NodeRef<TNode extends ChildNode = ChildNode> {
    /**
     * The referenced child node.
     */
    readonly node: TNode;
}
