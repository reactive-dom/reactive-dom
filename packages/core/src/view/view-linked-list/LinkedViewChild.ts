import { View, NodeHost } from '@reactive-dom/api';

/**
 * Looks for the first node starting from the supplied LinkedViewChild.
 * If no node is found in the current LinkedViewChild, it looks to the next sibling until a node is found,
 * or returns null if no next sibling is referenced.
 *
 * @param   linkedView - The child view to start looking for a node from.
 * @returns Node or null.
 */
function getFirstNode<TChildNode extends ChildNode>(linkedView: LinkedViewChild<TChildNode>): TChildNode | null {
    let currentView: LinkedViewChild<TChildNode> = linkedView;
    while (!currentView.firstChild && currentView.nextSibling) {
        currentView = currentView.nextSibling;
    }

    return currentView.firstChild;
}

/**
 * Implements View and NodeHost with added reference to next and previous LinkedViewChild siblings.
 * Used to build a doubly linked list in {@link ViewLinkedList}.
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @internal
 */
export class LinkedViewChild<TChildNode extends ChildNode, TNamespaceURI extends string = string>
    implements View<TChildNode, TNamespaceURI>, NodeHost<TChildNode, TNamespaceURI> {
    private _parentView: View<TChildNode, TNamespaceURI>;
    private _headNodeRef: TChildNode | null = null;
    private _tailNodeRef: TChildNode | null = null;

    public nextSibling: LinkedViewChild<TChildNode, TNamespaceURI> | null = null;
    public previousSibling: LinkedViewChild<TChildNode, TNamespaceURI> | null = null;

    // private _fixedSiblings: boolean = false;
    // private _fixedChildren: boolean = true;

    public constructor(
        parentView: View<TChildNode, TNamespaceURI>,
        previousSibling: LinkedViewChild<TChildNode, TNamespaceURI> | null = null,
        nextSibling: LinkedViewChild<TChildNode, TNamespaceURI> | null = null,
    ) {
        this._parentView = parentView;
        this.previousSibling = previousSibling;
        this.nextSibling = nextSibling;
    }

    public get ownerDocument(): Document {
        return this._parentView.ownerDocument;
    }

    public get namespaceURI(): TNamespaceURI | null {
        return this._parentView.namespaceURI;
    }

    private insertBeforeRef<T extends TChildNode>(newChild: T, refChild: TChildNode | null): void {
        if (refChild === this._headNodeRef) this._headNodeRef = newChild;
        if (!refChild) this._tailNodeRef = newChild;
    }

    public insertBefore<T extends TChildNode>(newChild: T, refChild: TChildNode | null): void {
        const currentTailNodeRef = this._tailNodeRef;
        this.removeChildRef(newChild);
        this.insertBeforeRef(newChild, refChild);

        this._parentView.insertBefore(
            newChild,
            refChild ||
                (currentTailNodeRef?.nextSibling as TChildNode) ||
                (this.nextSibling && getFirstNode(this.nextSibling)),
        );
    }

    private removeChildRef<T extends TChildNode>(oldChild: T): void {
        if (oldChild === this._headNodeRef) {
            if (this._headNodeRef === this._tailNodeRef) {
                this._headNodeRef = null;
                this._tailNodeRef = null;
            } else {
                this._headNodeRef = this._headNodeRef.nextSibling as TChildNode;
            }
        } else if (oldChild === this._tailNodeRef) {
            this._tailNodeRef = this._tailNodeRef.previousSibling as TChildNode;
        }
    }

    public removeChild<T extends TChildNode>(oldChild: T): void {
        this.removeChildRef(oldChild);
        this._parentView.removeChild(oldChild);
    }

    public replaceChild<T extends TChildNode>(newChild: T, oldChild: TChildNode): void {
        this.insertBeforeRef(newChild, oldChild);
        this.removeChildRef(oldChild);
        this._parentView.replaceChild(newChild, oldChild);
    }

    public get firstChild(): TChildNode | null {
        return this._headNodeRef;
    }

    public get lastChild(): TChildNode | null {
        return this._tailNodeRef;
    }

    public write(node: TChildNode): void {
        const headNode = this._headNodeRef as TChildNode;
        if (headNode) {
            this.replaceChild(node, headNode);
        } else {
            this.insertBefore(node, null);
        }
    }
    public remove(): void {
        const node = this._headNodeRef as TChildNode;
        if (node) {
            this.removeChild(node);
        }
    }
    public get node(): ChildNode {
        return this._headNodeRef as ChildNode;
    }

    // // Potential memory/GC optimization (To revaluate later)

    // public fixedSiblings(): void {
    //     this._fixedSiblings = true;
    //     this.previousSibling?.fixedSiblings();

    //     if (this._fixedChildren) {
    //         // console.log('disconnect 1');
    //         this.nextSibling = null;
    //         this.previousSibling = null;
    //     }
    // }

    // public fixedChildren(): void {
    //     this._fixedChildren = true;
    //     delete this._parentView;

    //     if (this._fixedSiblings) {
    //         // console.log('disconnect 2');
    //         this.nextSibling = null;
    //         this.previousSibling = null;
    //     }
    // }
}
