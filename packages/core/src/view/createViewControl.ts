import { Observable } from 'rxjs';
import { Control, ViewContext } from '@reactive-dom/api';
import { Subscribable, Subscription } from '../utils';
import { ViewLinkedList } from './view-linked-list';
import { ViewChange } from './ViewChange';
import { Detachable } from './Detachable';
import { ViewChildKey } from './ViewChildKey';
import { MoveViewChildTask, RemoveChildViewTask } from './ViewChangeTasks';

/**
 * Class used to connect to observable source and execute the received ViewChange commands.
 *
 * @typeParam   TChildNode - The ViewContext view child nodes type.
 */
class ViewChangeWriter<TChildNode extends ChildNode> {
    private readonly viewList: ViewLinkedList<TChildNode>;
    private readonly detachableChildren: Map<ViewChildKey, Detachable>;
    private readonly context: ViewContext<TChildNode>;
    private onDetachSubscription: Subscription;

    /**
     * Creates an instance of ViewChangeWriter.
     *
     * @param   context - The ViewContext used to execute the received ViewChange commands.
     */
    public constructor(context: ViewContext<TChildNode>, source: Subscribable<ViewChange<TChildNode>[]>) {
        this.context = context;
        this.viewList = new ViewLinkedList(context.dom.view);
        this.detachableChildren = new Map<ViewChildKey, Detachable>();

        const subscription = source.subscribe(this);
        this.onDetachSubscription = this.context.onDetach(subscription.unsubscribe.bind(subscription));
    }

    /**
     * Receives a batch (array) of ViewChange commands to be executed on the ViewContext view.
     *
     * @param   changes - An array of ViewChange commands to be executed.
     */
    public next(changes: ViewChange<TChildNode>[]): void {
        const {
            dom: { view, scheduler },
        } = this.context;

        for (let change of changes) {
            const { childKey } = change;

            switch (change.type) {
                case 'insert': {
                    const { refChildKey, childControl } = change;

                    const detachable = new Detachable();
                    this.detachableChildren.set(childKey, detachable);
                    const host = this.viewList.insertBefore(childKey, refChildKey);

                    childControl.init({
                        ...this.context,
                        dom: {
                            document,
                            scheduler,
                            view: host,
                            nodeHost: host,
                        },
                        onDetach: detachable.onDetach.bind(detachable),
                    });

                    break;
                }
                case 'remove': {
                    const viewDetach = this.detachableChildren.get(childKey);
                    if (viewDetach) {
                        viewDetach.detach();
                        this.detachableChildren.delete(childKey);
                    }

                    scheduler.schedule(new RemoveChildViewTask(view, this.viewList, change.childKey));
                    break;
                }
                case 'move': {
                    scheduler.schedule(new MoveViewChildTask(view, this.viewList, change));
                    break;
                }
            }
        }
    }

    /**
     * Calls all the onDetach handlers registered on child controls' context, and disposes of any other resources.
     */
    public complete(): void {
        // // Optimization (To revaluate later)
        // this.viewList.fixedChildren();
        for (const cvd of this.detachableChildren.values()) cvd.detach();
        this.detachableChildren.clear();

        this.onDetachSubscription.unsubscribe();
    }
}

/**
 * A View Control which subscribes to a stream of ViewChange commands from an observable source.
 * Using the supplied ViewChange commands the control is able to insert, move, and remove child controls.
 *
 * @remarks
 * The observable source is subscribed to on control init, and unsubscribed on context detach.
 *
 * @typeParam   TChildNode - The View child nodes type.
 */
class DynamicViewControl<TChildNode extends ChildNode> {
    private changes$: Subscribable<ViewChange<TChildNode>[]>;

    /**
     * Creates an instance of DynamicViewControl.
     * @param   source - Observable array of ViewChange commands.
     */
    public constructor(source: Subscribable<ViewChange<TChildNode>[]>) {
        this.changes$ = source;
    }

    public init(context: ViewContext<TChildNode>): void {
        new ViewChangeWriter(context, this.changes$);
    }
}

/**
 * Creates a View Control which subscribes to a stream of ViewChange commands from an observable `source`.
 * From the stream of ViewChange commands the control is able to insert, move, and remove child controls.
 *
 * @remarks
 * The observable source is subscribed to on control init, and unsubscribed on context detach.
 *
 * @typeParam   TChildNode - The View child nodes type.
 * @typeParam   TNamespaceURI - The `hostViewFactory` View namespaceURI type.
 *
 * @param   source - The observable emitting batches of ViewChange commands.
 *
 * @returns The created View Control.
 */
export function createViewControl<TChildNode extends ChildNode, TNamespaceURI extends string = string>(
    source: Observable<ViewChange<TChildNode, TNamespaceURI>[]>,
): Control<ViewContext<TChildNode, TNamespaceURI>> {
    return new DynamicViewControl(source);
}
