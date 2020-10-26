import { ViewContext, NodeHostContext, Control } from '@reactive-dom/api';
import { LinkedViewChild } from './view-linked-list';
import { ViewChildControl } from './ViewChildControl';

class AggregateViewControl<TChildNode extends ChildNode> {
    protected readonly childControls: ViewChildControl<TChildNode>[];
    public constructor(childViews: ViewChildControl<TChildNode>[]) {
        this.childControls = childViews;
    }

    public init(context: ViewContext<TChildNode>): void {
        const totalViews = this.childControls.length;

        if (totalViews === 1) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (context.dom as any).nodeHost = new LinkedViewChild(context.dom.view, null, null);
            this.childControls[0].init(context as NodeHostContext<TChildNode> & ViewContext<TChildNode>);
        } else if (totalViews > 0) {
            const { document, scheduler, view } = context.dom;

            let previousView: LinkedViewChild<TChildNode> = new LinkedViewChild(view, null, null);
            this.childControls[0].init({
                ...context,
                dom: { document, scheduler, view: previousView, nodeHost: previousView },
            });

            for (let i = 1; i < totalViews; i++) {
                previousView = previousView.nextSibling = new LinkedViewChild(view, previousView, null);
                this.childControls[i].init({
                    ...context,
                    dom: { document, scheduler, view: previousView, nodeHost: previousView },
                });
            }

            // // Optimization (To revaluate later)
            // previousView?.fixedSiblings();
        }
    }
}

/**
 * Composes a View Control from a list of child controls (i.e. ViewChildControl).
 * Child controls are rendered in the given order.
 *
 * @typeParam   TChildNode - The View child nodes type.
 * @typeParam   TNamespaceURI - The `hostViewFactory` View namespaceURI type.
 *
 * @param   controls - The list of View Controls and NodeHost Controls to aggregate.
 *
 * @returns The composed View Control.
 */
export function composeViewControl<TChildNode extends ChildNode, TNamespaceURI extends string = string>(
    controls: ViewChildControl<TChildNode, TNamespaceURI>[],
): Control<ViewContext<TChildNode, TNamespaceURI>> {
    return new AggregateViewControl(controls);
}
