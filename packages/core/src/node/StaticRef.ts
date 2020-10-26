import { View, NodeHost, NodeRef } from '@reactive-dom/api';

/**
 * Class that implements both View and NodeRef interface.
 * Used to initialize a NodeRef/View object from NodeHost that is passed to child Controls.
 *
 * @typeParam   TNode - The type of node referenced by the NodeRef interface.
 * @typeParam   TChildNode - The child nodes type of the View interface.
 *
 * @internal
 */
export class StaticRef<TNode extends ChildNode, TChildNode extends ChildNode>
    implements View<TChildNode>, NodeRef<TNode> {
    private _nodeHost: NodeHost<TNode>;
    private _element: TNode | null = null;

    /**
     * Creates an instance of StaticRef.
     *
     * @param   nodeHost - The NodeHost referenced by StaticRef instance.
     */
    public constructor(nodeHost: NodeHost<TNode>) {
        this._nodeHost = nodeHost;
    }

    public get node(): TNode {
        if (this._element) return this._element;

        this._element = this._nodeHost.node as TNode;

        if (this._element) this._nodeHost = (undefined as unknown) as NodeHost<TNode>;

        return this._element;
    }

    public get ownerDocument(): Document {
        return this.node.ownerDocument as Document;
    }

    public get namespaceURI(): string | null {
        return this.node.namespaceURI;
    }

    public insertBefore<T extends TChildNode>(newChild: T, refChild: TChildNode | null): void {
        this.node.insertBefore(newChild, refChild);
    }

    public removeChild<T extends TChildNode>(oldChild: T): void {
        this.node.removeChild(oldChild);
    }

    public replaceChild<T extends TChildNode>(newChild: T, oldChild: TChildNode): void {
        this.node.replaceChild(newChild, oldChild);
    }

    public get firstChild(): ChildNode | null {
        return this.node.firstChild;
    }

    public get lastChild(): ChildNode | null {
        return this.node.lastChild;
    }
}
