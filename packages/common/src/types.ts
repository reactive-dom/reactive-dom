import { Observable } from 'rxjs';
import { ViewControl, NodeHostControl } from './Controls';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributedPromise<T> = T extends any ? Promise<T> : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributedObservable<T> = T extends any ? Observable<T> : never;

// Use [] to disable the distribution for the conditional type.
// See: https://stackoverflow.com/questions/55542332/typescript-conditional-type-with-discriminated-union
type NodeValue<T extends ChildNode = ChildNode> = [T] extends [Element] ? T : T | string | number;

/**
 * A value or object type that portrays a node, and is convertible to NodeHostControl.
 *
 * @typeParam   TNode - The node type.
 */
export type NodeType<TNode extends ChildNode = ChildNode> =
    | NodeHostControl<TNode>
    | NodeValue<TNode>
    | DistributedObservable<NodeValue<TNode>>;

/**
 * A ViewList child value or Control.
 *
 * @typeParam   TChildNode - The view child nodes type.
 */
export type ViewListItem<TChildNode extends ChildNode = ChildNode> =
    | NodeType<TChildNode>
    | ViewControl<TChildNode>
    | DistributedPromise<NodeType<TChildNode> | ViewControl<TChildNode>>;

/**
 * An array of values and Controls which make up a view.
 *
 * @typeParam   TChildNode - The view child nodes type.
 */
export type ViewList<T extends ChildNode = ChildNode> = ViewListItem<T>[];

/**
 * A value or object type that portrays a view, and is convertible to ViewControl.
 *
 * @typeParam   TChildNode - The view child nodes type.
 */
export type ViewType<T extends ChildNode = ChildNode> = ReadonlyArray<ViewListItem<T>> | ViewControl<T>;
