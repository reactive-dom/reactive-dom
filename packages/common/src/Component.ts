import { Control, DomContext, NodeHostContext, NodeRefContext, ViewContext } from '@reactive-dom/api';
import { NodeRefControl, ViewControl } from './Controls';
import { NodeType, ViewType } from './types';
import { toControl } from './toControl';

/**
 * Function component.
 *
 * @typeParam   TProps - The component props object type.
 * @typeParam   TReturn - The component render view or node type.
 */
export interface FunctionComponent<
    TProps,
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
> {
    (props: TProps, context: DomContext): TReturn;
}

function isFunctionComponent<
    TProps,
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
>(value: unknown): value is FunctionComponent<TProps, TReturn> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof value === 'function' && !(value.prototype as any).render;
}

/**
 * Class component constructor.
 *
 * @typeParam   TProps - The component props object type.
 * @typeParam   TReturn - The component render view or node type.
 */
export interface ClassComponent<
    TProps,
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
> {
    new (props: TProps, context: DomContext): Component<TReturn>;
}

/**
 * Component interface.
 *
 * @typeParam   TReturn - The component render view or node type.
 */
export interface Component<
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
> {
    /**
     * Returns the component view or node to be rendered.
     *
     * @returns The component view or node to be rendered.
     */
    render(): TReturn;

    /**
     * Invoked when the component is detached.
     * Used to dispose of resources.
     */
    dispose?: () => void;
}

function isClassComponent<
    TProps,
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
>(value: unknown): value is ClassComponent<TProps, TReturn> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof value === 'function' && typeof (value.prototype as any).render === 'function';
}

/**
 * Class or function component type.
 *
 * @typeParam   TProps - Props object type required by the function/class component.
 * @typeParam   TReturn - The component render view or node type.
 */
export type ComponentType<
    TProps,
    TReturn extends ViewType | NodeType | Promise<ViewType> | Promise<NodeType> =
        | ViewType
        | NodeType
        | Promise<ViewType>
        | Promise<NodeType>
> = ClassComponent<TProps, TReturn> | FunctionComponent<TProps, TReturn>;

/**
 * Obtain the component's render/return type.
 *
 * @typeParam   TComponent - Component type.
 */
type ComponentRenderType<TComponent extends ComponentType<any>> = TComponent extends
    | {
          new (...args: any[]): { render(): infer T };
      }
    | ((...args: any[]) => infer T)
    ? T
    : never;

/**
 * Obtain the component's Context type.
 *
 * @typeParam   TComponent - Component type.
 */
export type ComponentContext<TComponent extends ComponentType<any>> = ComponentRenderType<TComponent> extends
    | ViewType<infer TNode>
    | Promise<ViewType<infer TNode>>
    ? ViewContext<TNode>
    : ComponentRenderType<TComponent> extends NodeType<infer TNode> | Promise<NodeType<infer TNode>>
    ? NodeHostContext<TNode>
    : DomContext;

/**
 * Returns component's directive Control type.
 *
 * @typeParam   TComponent - Component type.
 */
export type ComponentDirective<TComponent extends ComponentType<any>> = ComponentRenderType<TComponent> extends
    | ViewType<infer TNode>
    | Promise<ViewType<infer TNode>>
    ? ViewControl<TNode>
    : ComponentRenderType<TComponent> extends NodeType<infer TNode> | Promise<NodeType<infer TNode>>
    ? NodeRefControl<TNode>
    : Control<DomContext>;

function isNodeHostContext<TNode extends ChildNode>(value: any): value is NodeHostContext<TNode> {
    return value?.dom?.nodeHost != undefined;
}

/**
 * Creates a control for a component class or function.
 *
 * @typeParam   TComponent - Component type.
 */
class ComponentControl<TComponent extends ComponentType<any>> implements Control<ComponentContext<TComponent>> {
    private component: TComponent;
    private props: TComponent extends ComponentType<infer TProps> ? TProps : never;
    private directives: ComponentDirective<TComponent>[];

    /**
     * Creates an instance of ComponentControl.
     *
     * @param   component - Component class or function.
     * @param   props - Props to be passed to the component on initialization.
     * @param   directives - Controls to be executed on the component's directives context.
     */
    public constructor(
        component: TComponent,
        props: TComponent extends ComponentType<infer TProps> ? TProps : never,
        directives: ComponentDirective<TComponent>[],
    ) {
        this.component = component;
        this.props = props;
        this.directives = directives;
    }

    public async init(context: ComponentContext<TComponent>): Promise<void> {
        let value: ComponentRenderType<TComponent>;

        if (isClassComponent(this.component)) {
            const instance = new this.component(this.props, context);
            value = instance.render() as ComponentRenderType<TComponent>;
            if (instance.dispose) context.onDetach(instance.dispose.bind(instance));
        } else if (isFunctionComponent(this.component)) {
            value = this.component(this.props, context) as ComponentRenderType<TComponent>;
        } else {
            throw new Error('Invalid Component');
        }

        (toControl(value as ViewType<any> | NodeType<any>) as Control<ComponentContext<TComponent>>).init(context);

        const directiveContext = isNodeHostContext(context)
            ? { ...context, dom: { ...context.dom, nodeRef: context.dom.nodeHost } }
            : context;

        for (const dir of this.directives)
            dir.init((directiveContext as any) as ViewContext<any> & NodeRefContext<any>);
    }
}

/**
 * Creates a control for a component class or function.
 *
 * @typeParam   TComponent - Component type.
 *
 * @returns  Component Control.
 */
export function createComponentControl<TComponent extends ComponentType<any>>(
    component: TComponent,
    props: TComponent extends ComponentType<infer TProps> ? TProps : never,
    directives: ComponentDirective<TComponent>[],
): Control<ComponentContext<TComponent>> {
    return new ComponentControl(component, props, directives);
}
