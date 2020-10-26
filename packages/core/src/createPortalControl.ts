import { View, DomContext, DomScheduler, Control, ViewContext } from '@reactive-dom/api';
import { LinkedViewChild } from 'view/view-linked-list';

/**
 * Returns a Promise that resolves after the scheduled 'mutate' tasks are executed.
 */
function onNextRender(scheduler: DomScheduler): Promise<void> {
    return new Promise(resolve => {
        scheduler.schedule({ queue: 'mutate', operation: () => resolve() });
    });
}

/**
 * DomScheduler Task that removes all child nodes in a view.
 */
class ClearViewTask<TChildNode extends ChildNode> {
    private view: View<TChildNode>;
    public constructor(view: View<TChildNode>) {
        this.view = view;
    }

    public readonly queue = 'mutate';

    public operation(): void {
        while (this.view.lastChild) {
            this.view.removeChild(this.view.lastChild as TChildNode);
        }
    }
}

class PortalControl<TChildNode extends ChildNode, TNamespaceURI extends string = string> {
    private viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>;
    private hostViewFactory: (document: Document) => View<TChildNode, TNamespaceURI>;

    public constructor(
        viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>,
        hostViewFactory: (document: Document) => View<TChildNode, TNamespaceURI>,
    ) {
        this.viewControl = viewControl;
        this.hostViewFactory = hostViewFactory;
    }

    public async init(context: DomContext): Promise<void> {
        const { viewControl, hostViewFactory } = this;
        const {
            onDetach,
            dom: { document, scheduler },
        } = context;

        // Note
        // Host selector might be referencing a node that has not been rendered (added to the DOM) yet.
        // To be safe we wait after the next render to initiate the portal view.
        await onNextRender(scheduler);

        // Creates a sub view inside the host view (using LinkedViewChild) to keep reference of the view boundary (first & last child).
        // This prevents unwanted tampering/deleting of other unrelated nodes in the same host view.
        const view = new LinkedViewChild(hostViewFactory(document));

        const viewContext = {
            ...context,
            dom: {
                document: view.ownerDocument,
                scheduler: scheduler,
                view: view,
            },
        };

        viewControl.init(viewContext);

        onDetach(() => {
            scheduler.schedule(new ClearViewTask(view));
        });
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
 *
 * @returns Portal View Control.
 */
export function createPortalControl<TChildNode extends ChildNode, TNamespaceURI extends string = string>(
    hostViewFactory: (document: Document) => View<TChildNode, TNamespaceURI>,
    viewControl: Control<ViewContext<TChildNode, TNamespaceURI>>,
): Control<DomContext> {
    return new PortalControl(viewControl, hostViewFactory);
}
