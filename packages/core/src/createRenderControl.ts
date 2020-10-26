import { Context, DomScheduler, DomContext, View, Control, ViewContext } from '@reactive-dom/api';
import { LinkedViewChild } from './view/view-linked-list';
import { createDomScheduler } from './dom-scheduler';

class RenderControl<TChildNode extends ChildNode, TNamespaceURI extends string = string> implements Control<Context> {
    private viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>;
    private hostViewFactory: () => View<TChildNode, TNamespaceURI>;
    private scheduler?: DomScheduler;

    public constructor(
        hostViewFactory: () => View<TChildNode, TNamespaceURI>,
        viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>,
        scheduler?: DomScheduler,
    ) {
        this.viewControl = viewControl;
        this.hostViewFactory = hostViewFactory;
        this.scheduler = scheduler;
    }

    public init(context: Context): void {
        const { viewControl, hostViewFactory, scheduler } = this;

        // Creates a sub view inside the host view (using LinkedViewChild) to keep reference of the view boundary (first & last child).
        // This prevents unwanted tampering/deleting of other unrelated nodes in the same host view.
        const view = new LinkedViewChild(hostViewFactory());

        const viewContext = {
            ...context,
            dom: {
                document: view.ownerDocument,
                scheduler: scheduler || (context as DomContext)?.dom?.scheduler || createDomScheduler(),
                view: view,
            },
        };

        viewControl.init(viewContext);
    }
}

/**
 * Creates a Control that renders the `viewControl` inside the View/Element returned by the `hostViewFactory`.
 *
 * @typeParam   TChildNode - The `hostViewFactory` View child nodes type.
 * @typeParam   TNamespaceURI - The `hostViewFactory` View namespaceURI type.
 *
 * @param   hostViewFactory - Factory of the View where the `viewControl` is rendered.
 * @param   viewControl - View Control to be rendered.
 * @param   scheduler - The DomScheduler used to schedule DOM tasks.
 *
 * @returns Render View Control.
 */
export function createRenderControl<TChildNode extends ChildNode, TNamespaceURI extends string = string>(
    hostViewFactory: () => View<TChildNode, TNamespaceURI>,
    viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>,
    scheduler?: DomScheduler,
): Control<Context> {
    return new RenderControl(hostViewFactory, viewControl, scheduler);
}
