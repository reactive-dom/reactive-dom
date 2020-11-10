import { isObservable } from 'rxjs';
import { ViewContext, NodeHostContext, NodeHost, Context, Task, Control } from '@reactive-dom/api';
import { composeViewControl } from '@reactive-dom/core';
import { NodeType, ViewType, ViewList } from './types';
import { ViewControl, NodeHostControl } from './Controls';

type DistributePromise<T> = T extends T ? Promise<T> : never;

function isChildNode<T extends ChildNode>(value: unknown): value is T {
    return value instanceof Node;
}

function isControl<TContext extends Context = Context>(value: unknown): value is Control<TContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return value && typeof (value as any).init === 'function';
}

function isViewList<TNode extends ChildNode>(value: unknown): value is ViewList<TNode> {
    return Array.isArray(value);
}

class WriteNodeTask<TNode extends ChildNode> implements Task {
    private nodeHost: NodeHost<TNode>;
    private node: TNode;

    public queue = 'mutate';

    public constructor(nodeHost: NodeHost<TNode>, node: TNode) {
        this.nodeHost = nodeHost;
        this.node = node;
    }

    public operation(): void {
        this.nodeHost.write(this.node);
    }

    public get metadata(): { [key: string]: unknown } {
        return {
            target: this.nodeHost,
            signature: 'writeNode',
        };
    }
}

class WriteTextNodeTask<TNode extends ChildNode> implements Task {
    private nodeHost: NodeHost<TNode>;
    private document: Document;
    private value: string;

    public queue = 'mutate';

    public constructor(nodeHost: NodeHost<TNode>, document: Document, value: string) {
        this.nodeHost = nodeHost;
        this.document = document;
        this.value = value;
    }

    public operation(): void {
        // Set Text node content if Text node already exists.
        if (this.nodeHost.node instanceof Text) {
            this.nodeHost.node.textContent = this.value;
        } else {
            this.nodeHost.write((this.document.createTextNode(this.value) as unknown) as TNode);

            // Optimization (To revaluate later)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // if ((this.nodeHost as any).fixedChildren) (this.nodeHost as any).fixedChildren();
        }
    }

    public get metadata(): { [key: string]: unknown } {
        return {
            target: this.nodeHost,
            signature: 'writeNode',
        };
    }
}

function nodeValueHandler(this: NodeHostContext, val: unknown): void {
    const { nodeHost, scheduler, document } = this.dom;

    if (isChildNode(val)) {
        scheduler.schedule(new WriteNodeTask(nodeHost, val));
    } else {
        scheduler.schedule(new WriteTextNodeTask(nodeHost, document, String(val)));
    }
}

/**
 * Control that renders a give `value` accordingly.
 *
 * @typeParam   TChildNode - The view child nodes type.
 */
class ValueControl<TChildNode extends ChildNode> {
    private rawValue: unknown;

    public constructor(
        value:
            | NodeType<TChildNode>
            | ViewType<TChildNode>
            | DistributePromise<NodeType<TChildNode>>
            | DistributePromise<ViewType<TChildNode>>,
    ) {
        this.rawValue = value;
    }

    public async init(context: NodeHostContext<TChildNode> & ViewContext<TChildNode>): Promise<void> {
        // Do not await if not necessary. await will always wrap the value into a Promise.
        // Also, reassign the resolved value, so it doesn't have to await on next init.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value =
            typeof (this.rawValue as Promise<unknown>)?.then === 'function'
                ? (this.rawValue = await this.rawValue)
                : this.rawValue;

        if (isControl(value)) {
            value.init(context);
        } else if (isObservable(value)) {
            const subscription = value.subscribe(nodeValueHandler.bind(context));
            subscription.add(context.onDetach(subscription.unsubscribe.bind(subscription)));
        } else if (isViewList<TChildNode>(value)) {
            const control = toViewControl<TChildNode>(value);
            // Assign the computed Control, so it doesn't have to be computed on next init.
            this.rawValue = control;
            control.init(context);
        } else {
            nodeValueHandler.call(context, value);
        }
    }
}

/**
 * Converts viewList to Control.
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @param   viewList - Array to be converted to Control.
 *
 * @returns Created view Control.
 */
function toViewControl<TChildNode extends ChildNode>(viewList: ViewList<TChildNode>): ViewControl<TChildNode> {
    const viewLength = viewList.length;
    const views: (ViewControl<TChildNode> | NodeHostControl<TChildNode>)[] = new Array(viewLength);

    for (let i = 0; i < viewLength; i++) {
        const child = viewList[i];
        views[i] = isControl(child) ? child : new ValueControl(child);
    }

    return composeViewControl(views);
}

/**
 * Converts `value` to a Control.
 *
 * @typeParam   TNode - The Control child nodes type.
 *
 * @param   value - Value to be converted to Control.
 *
 * @returns Control that renders the `value`.
 */
export function toControl<TNode extends ChildNode>(
    value: ViewType<TNode> | DistributePromise<ViewType<TNode>>,
): ViewControl<TNode>;
export function toControl<TNode extends ChildNode>(
    value: NodeType<TNode> | DistributePromise<NodeType<TNode>>,
): NodeHostControl<TNode>;
export function toControl<TNode extends ChildNode>(
    value: ViewType<TNode> | NodeType<TNode> | DistributePromise<ViewType<TNode> | NodeType<TNode>>,
): ViewControl<TNode> | NodeHostControl<TNode>;
export function toControl<TNode extends ChildNode>(
    value: NodeType<TNode> | ViewType<TNode> | DistributePromise<ViewType<TNode> | NodeType<TNode>>,
): NodeHostControl<TNode> | ViewControl<TNode> {
    if (isViewList<TNode>(value)) {
        return toViewControl(value);
    } else if (isControl(value)) {
        return value;
    } else {
        return new ValueControl(value);
    }
}
