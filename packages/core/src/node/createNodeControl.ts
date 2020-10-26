import { NodeHostContext, Control, ViewContext, NodeRefContext } from '@reactive-dom/api';
import { Props } from './Props';
import { StaticRef } from './StaticRef';
import { WriteNodeTask } from './WriteNodeTask';
import { NamespaceUriType } from '../utils';

/**
 * A Control that composes and inserts a node on he parent DOM tree.
 *
 * @typeParam   TNode - Type of ChildNode to be added.
 * @typeParam   TChildNode - Node children node type.
 */
class StaticNodeControl<TNode extends ChildNode, TChildNode extends ChildNode = ChildNode>
    implements Control<NodeHostContext<TNode>> {
    protected nodeFactory: (document: Document, namespaceURI: string | null) => TNode;
    protected props: Props<TNode>;
    protected directives?: Control<NodeRefContext<TNode>>[];
    protected view?: Control<ViewContext<TChildNode>>;

    /**
     * Creates an instance of StaticNodeControl.
     *
     * @param   nodeFactory - Factory function that returns instance of TNode.
     * @param   props - Static/observable props to be added to the node.
     * @param   directives - List of NodeRef Controls to be executed.
     * @param   view - View Control to handle the element subtree.
     */
    public constructor(
        nodeFactory: (document: Document, namespaceURI: string | null) => TNode,
        props: Props<TNode>,
        directives?: Control<NodeRefContext<TNode>>[],
        view?: Control<ViewContext<TChildNode>>,
    ) {
        this.nodeFactory = nodeFactory;
        this.props = props;
        this.directives = directives;
        this.view = view;
    }

    public init(context: NodeHostContext<TNode>): void {
        const {
            dom: { nodeHost, scheduler, document },
        } = context;

        scheduler.schedule(new WriteNodeTask(context, this.nodeFactory, this.props));

        if (this.view || this.directives) {
            const wrapper = new StaticRef(nodeHost);
            const nodeRefAndViewContext = {
                ...context,
                dom: {
                    document,
                    scheduler,
                    nodeRef: wrapper,
                    view: wrapper,
                },
            };

            if (this.directives) {
                for (let dir of this.directives) {
                    dir.init(nodeRefAndViewContext);
                }
            }

            if (this.view) {
                this.view.init(nodeRefAndViewContext);
            }
        }
    }
}

/**
 * Creates a NodeHost Control.
 *
 * @typeParam   TNode - Type of ChildNode to be added.
 * @typeParam   TChildNode - Node children node type.
 *
 * @param   nodeFactory - Factory function that returns instance of TNode.
 * @param   props - Value/observable props to be added to the node.
 * @param   directives - List of NodeRef Controls to be executed.
 * @param   view - View Control to handle the element subtree.
 *
 * @returns The composed NodeHost Control.
 */
export function createNodeControl<TNode extends ChildNode, TChildNode extends ChildNode = ChildNode>(
    nodeFactory: (document: Document, namespaceURI: string | null) => TNode,
    props: Props<TNode> = {},
    directives?: Control<NodeRefContext<TNode>>[],
    view?: Control<ViewContext<TChildNode, NamespaceUriType<TNode>>>,
): Control<NodeHostContext<TNode>> {
    return new StaticNodeControl(nodeFactory, props, directives, view);
}
