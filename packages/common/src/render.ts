import { DomScheduler, View, Context, Control } from '@reactive-dom/api';
import { createRenderControl } from '@reactive-dom/core';
import { ViewList, ViewType } from './types';
import { toControl } from './toControl';
import { ViewControl } from './Controls';

/**
 * Renders a ViewList inside a host view/element
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @param   viewList - The ViewList to be rendered.
 * @param   hostView - The host View where the `viewList` is rendered.
 * @param   scheduler - DOM scheduler to delegate DOM operations.
 *
 * @returns Control which renders a ViewList in a host View/Element.
 */
export function render<TChildNode extends ChildNode>(
    viewList: ViewList<TChildNode>,
    hostView: View<TChildNode>,
    scheduler?: DomScheduler,
): Control<Context>;
/**
 * Renders a ViewList inside a host view/element
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @param   viewList - The ViewList to be rendered.
 * @param   hostViewFactory - Function that returns the host View where the `viewList` is rendered.
 * @param   scheduler - DOM scheduler to delegate DOM operations.
 *
 * @returns Control which renders a ViewList in a host View/Element.
 */
export function render<TChildNode extends ChildNode>(
    viewList: ViewList<TChildNode>,
    hostViewFactory: () => View<TChildNode>,
    scheduler?: DomScheduler,
): Control<Context>;
/**
 * Renders a ViewControl inside a host view/element
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @param   viewControl - The ViewControl to be rendered.
 * @param   hostView - The host View where the `viewControl` is rendered.
 * @param   scheduler - DOM scheduler to delegate DOM operations.
 *
 * @returns Control which renders a ViewControl in a host View/Element.
 */
export function render<TChildNode extends ChildNode>(
    viewControl: ViewControl<TChildNode>,
    hostView: View<TChildNode>,
    scheduler?: DomScheduler,
): Control<Context>;
/**
 * Renders a ViewControl inside a host view/element
 *
 * @typeParam   TChildNode - The view child nodes type.
 *
 * @param   viewControl - The ViewControl to be rendered.
 * @param   hostViewFactory - Function that returns the host View where the `viewControl` is rendered.
 * @param   scheduler - DOM scheduler to delegate DOM operations.
 *
 * @returns Control which renders a ViewControl in a host View/Element.
 */
export function render<TChildNode extends ChildNode>(
    viewControl: ViewControl<TChildNode>,
    hostViewFactory: () => View<TChildNode>,
    scheduler?: DomScheduler,
): Control<Context>;
export function render<TChildNode extends ChildNode>(
    view: ViewType<TChildNode>,
    hostOrFactory: View<TChildNode> | (() => View<TChildNode>),
    scheduler?: DomScheduler,
): Control<Context> {
    const hostViewFactory = typeof hostOrFactory === 'function' ? hostOrFactory : () => hostOrFactory;
    return createRenderControl(hostViewFactory, toControl(view), scheduler);
}
