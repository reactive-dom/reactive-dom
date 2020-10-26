import { NodeHostContext, NodeRef, Task } from '@reactive-dom/api';
import { isSubscribable, Subscription, Subscribable } from '../utils';
import { Props } from './Props';
import { SetPropertyTask } from './SetPropertyTask';

/**
 * Class used to write values to a node `property` from an Observable `source`.
 * Subscribes to the Observable `source` on initialization and unsubscribes when the `context` is detached.
 *
 * @remarks
 * This pattern is used for memory efficiency and because the Observer implementation in most libraries (rxjs) do not support a 'start' handler
 * necessary to get the subscription so that it can unsubscribed by itself on `context` detach.
 *
 * @typeParam   TValue - The node property type.
 */
class NodePropWriter<TValue> {
    private context: NodeHostContext;
    private propName: string;

    public onDetachSubscription: Subscription;

    /**
     * Creates an instance of NodePropWriter.
     *
     * @param   context - NodeHostContext which references the node.
     * @param   property - Name of the property to be written.
     * @param   source - Observable stream of values to be assigned to the node `property`.
     */
    public constructor(context: NodeHostContext, property: string, source: Subscribable<TValue>) {
        this.context = context;
        this.propName = property;

        const subscription = source.subscribe(this);
        this.onDetachSubscription = this.context.onDetach(subscription.unsubscribe.bind(subscription));
    }

    public next(value: TValue): void {
        const { scheduler, nodeHost } = this.context.dom;

        if (scheduler.runningQueue === 'mutate') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (nodeHost.node as any)[this.propName] = value;
        } else {
            scheduler.schedule(new SetPropertyTask((nodeHost as unknown) as NodeRef, this.propName, value));
        }
    }

    public complete(): void {
        this.onDetachSubscription.unsubscribe();
    }
}

/**
 * DomScheduler Task that writes a node to the DOM.
 *
 * @typeParam   TNode - The node type.
 *
 * @internal
 */
export class WriteNodeTask<TNode extends ChildNode> implements Task {
    private context: NodeHostContext<TNode>;
    private nodeFactory: (document: Document, namespaceURI: string | null) => TNode;
    private props: Props<TNode>;

    public queue = 'mutate';

    /**
     * Creates an instance of WriteNodeTask.
     *
     * @param   context - NodeHostContext used to insert the node.
     * @param   nodeFactory - Function that returns the node to be inserted.
     * @param   props - Key/value pair object of node properties to be written.
     */
    public constructor(
        context: NodeHostContext<TNode>,
        nodeFactory: (document: Document, namespaceURI: string | null) => TNode,
        props: Props<TNode>,
    ) {
        this.context = context;
        this.nodeFactory = nodeFactory;
        this.props = props;
    }

    public operation(): void {
        const {
            dom: { document, nodeHost },
        } = this.context;

        nodeHost.write(this.nodeFactory(document, nodeHost.namespaceURI));

        // // Optimization (To revaluate later)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // (nodeHost as any).fixedChildren?.();

        const propsKeyValue = Object.entries(this.props);

        for (let [key, value] of propsKeyValue) {
            if (isSubscribable(value)) {
                new NodePropWriter(this.context, key, value);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (nodeHost.node as any)[key] = value;
            }
        }
    }
}
