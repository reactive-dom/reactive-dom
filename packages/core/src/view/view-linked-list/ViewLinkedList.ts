import { NodeHost, View } from '@reactive-dom/api';
import { LinkedViewChild } from './LinkedViewChild';
import { ViewChildKey } from 'view/ViewChildKey';

/**
 * Used to create and manage child views inside a `parentView`.
 * Keeps track of the child views order using a doubly linked list data structure.
 *
 * @typeParam   TChildNode - The view child nodes type.
 * @typeParam   TChildKey - The child views reference key type.
 *
 * @internal
 */
export class ViewLinkedList<TChildNode extends ChildNode> {
    private _parentView: View<TChildNode>;
    private _childViews: Map<ViewChildKey, LinkedViewChild<TChildNode>> = new Map();
    private _tailViewNode: LinkedViewChild<TChildNode> | null = null;

    /**
     * Creates a ViewLinkedList.
     * @param   parentView - The View in which child views/nodes are rendered in.
     */
    public constructor(parentView: View<TChildNode>) {
        this._parentView = parentView;
    }

    // Potential memory/GC optimization (To revaluate later)
    // public fixedChildren(): void {
    //     // this._tailViewNode?.fixedSiblings();
    //     delete this._parentView;
    //     delete this._tailViewNode;
    // }

    /**
     * Gets child view by its key.
     *
     * @param   childKey - The view key.
     * @returns The child view identified by the `nodeKey`, or null if no view is found.
     */
    public getView(childKey: ViewChildKey): (View<TChildNode> & NodeHost<TChildNode>) | null {
        return this._childViews.get(childKey) || null;
    }

    /**
     * Inserts a new view before the reference child view.
     * If the reference child view key is null, the view is inserted at the end of the parent view.
     *
     * @param   newChildKey - The key of the new view to be created and inserted.
     * @param   refChildKey - The key of the reference child view, or null.
     * @returns The newly created/inserted view.
     */
    public insertBefore(
        newChildKey: ViewChildKey,
        refChildKey: ViewChildKey | null,
    ): View<TChildNode> & NodeHost<TChildNode> {
        const nextSibling = (refChildKey && this._childViews.get(refChildKey)) || null;
        if (refChildKey && !nextSibling)
            throw new Error(
                "Uncaught NotFoundError: Failed to execute 'insertBefore' on 'ViewList': The view before which the new view is to be inserted is not a child of this view list.",
            );

        const existingChild = this._childViews.get(newChildKey);
        const newChildView: LinkedViewChild<TChildNode> = existingChild || new LinkedViewChild(this._parentView);

        if (existingChild) {
            this.detachView(existingChild);
        } else {
            // Store child view if new child view
            this._childViews.set(newChildKey, newChildView);
        }

        newChildView.nextSibling = nextSibling;
        const previousSibling = nextSibling ? nextSibling.previousSibling : this._tailViewNode;

        if (nextSibling) {
            newChildView.previousSibling = nextSibling.previousSibling;
            nextSibling.previousSibling = newChildView;
        } else {
            newChildView.previousSibling = this._tailViewNode;
            this._tailViewNode = newChildView;
        }

        if (previousSibling) previousSibling.nextSibling = newChildView;

        return newChildView;
    }

    /**
     * Detaches the child view from the linked list.
     *
     * @param   childView - The view to be removed from the linked list.
     */
    private detachView(childView: LinkedViewChild<TChildNode>): void {
        if (childView.nextSibling) {
            childView.nextSibling.previousSibling = childView.previousSibling;
        } else {
            this._tailViewNode = childView.previousSibling;
        }

        if (childView.previousSibling) childView.previousSibling.nextSibling = childView.nextSibling;

        childView.nextSibling = null;
        childView.previousSibling = null;
    }

    /**
     * Removes a child view.
     *
     * @param   childKey - The key of the view to be removed.
     */
    public removeChild(childKey: ViewChildKey): void {
        const childView = this._childViews.get(childKey);

        if (!childView)
            throw new Error(
                "Uncaught NotFoundError: Failed to execute 'removeChild' on 'ViewList': The view to be removed is not a child of this view list",
            );

        this.detachView(childView);
        this._childViews.delete(childKey);
    }
}
