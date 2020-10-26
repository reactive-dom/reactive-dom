import { ViewChildControl } from './ViewChildControl';
import { ViewChildKey } from './ViewChildKey';

export interface InsertViewChild<TChildNode extends ChildNode, TNamespaceURI extends string = string> {
    type: 'insert';
    childControl: ViewChildControl<TChildNode, TNamespaceURI>;
    childKey: ViewChildKey;
    refChildKey?: ViewChildKey;
}

export interface MoveViewChild {
    type: 'move';
    childKey: ViewChildKey;
    refChildKey: ViewChildKey | null;
}

export interface RemoveViewChild {
    type: 'remove';
    childKey: ViewChildKey;
}

export type ViewChange<TChildNode extends ChildNode, TNamespaceURI extends string = string> =
    | InsertViewChild<TChildNode, TNamespaceURI>
    | MoveViewChild
    | RemoveViewChild;
