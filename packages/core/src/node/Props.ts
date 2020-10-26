import { Observable } from 'rxjs';

// https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];

/**
 * Node properties key/value pairs.
 *
 * @typeParam   TNode - The node type.
 */
export type Props<TNode extends ChildNode> = {
    [key in keyof TNode]?: key extends WritableKeys<TNode> ? TNode[key] | Observable<TNode[key]> : never;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & { [key: string]: any };
