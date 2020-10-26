import { Task, View } from '@reactive-dom/api';
import { ViewLinkedList } from './view-linked-list';
import { MoveViewChild } from './ViewChange';
import { ViewChildKey } from './ViewChildKey';

/**
 * DomScheduler Task that removes all child view nodes and removes the child view from the view list.
 *
 * @typeParam   TChildNode - The View child nodes type.
 *
 * @internal
 */
export class RemoveChildViewTask<TChildNode extends ChildNode> implements Task {
    private readonly hostView: View<TChildNode>;
    private readonly viewList: ViewLinkedList<TChildNode>;
    private readonly childKey: ViewChildKey;
    private readonly childView: View<TChildNode>;

    public readonly queue = 'mutate';

    public constructor(hostView: View<TChildNode>, viewList: ViewLinkedList<TChildNode>, childKey: ViewChildKey) {
        this.hostView = hostView;
        this.viewList = viewList;
        this.childKey = childKey;
        this.childView = viewList.getView(childKey) as View<TChildNode>;
    }

    public get metadata(): {} {
        return {
            target: this.childView,
            signature: `removeViewChild`,
        };
    }

    public operation(): void {
        const lastNode = this.childView.lastChild;
        let nextNode: ChildNode | null = this.childView.firstChild as TChildNode;

        while (nextNode) {
            const node = nextNode;
            nextNode = nextNode === lastNode ? null : nextNode.nextSibling;
            // Instead of removing the node from the childView we remove the node directly from the parent hostView
            // so to avoid from having childView update its first/last child node references on every node removal.
            this.hostView.removeChild(node as TChildNode);
        }

        this.viewList.removeChild(this.childKey);
    }
}

/**
 * DomScheduler Task that moves the child view nodes and changes the child view position in the view list.
 *
 * @typeParam   TChildNode - The View child nodes type.
 *
 * @internal
 */
export class MoveViewChildTask<TChildNode extends ChildNode> implements Task {
    private readonly hostView: View<TChildNode>;
    private readonly viewList: ViewLinkedList<TChildNode>;
    private readonly moveCmd: MoveViewChild;
    private readonly childView: View<TChildNode>;
    private readonly refChildView: View<TChildNode> | null;

    public readonly queue = 'mutate';

    public constructor(hostView: View<TChildNode>, viewList: ViewLinkedList<TChildNode>, moveCmd: MoveViewChild) {
        this.hostView = hostView;
        this.viewList = viewList;
        this.moveCmd = moveCmd;
        this.childView = viewList.getView(moveCmd.childKey) as View<TChildNode>;
        this.refChildView = moveCmd.refChildKey && viewList.getView(moveCmd.refChildKey);
    }

    public get metadata(): {} {
        return {
            target: this.childView,
            signature: 'moveViewChild',
        };
    }

    public operation(): void {
        const refChildViewFirstChild = this.refChildView ? this.refChildView.firstChild : null;
        const lastNode = this.childView.lastChild;
        let nextNode: ChildNode | null = this.childView.firstChild as TChildNode;

        while (nextNode) {
            const node = nextNode;
            nextNode = nextNode === lastNode ? null : nextNode.nextSibling;
            this.hostView.insertBefore(node as TChildNode, refChildViewFirstChild as TChildNode);
        }

        this.viewList.insertBefore(this.moveCmd.childKey, this.moveCmd.refChildKey);
    }
}
