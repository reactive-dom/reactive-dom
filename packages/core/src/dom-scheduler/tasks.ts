import { NodeRef, View, Task, NodeHost } from '@reactive-dom/api';

/**
 * Metadata used to discern DOM operations.
 */
export interface TaskMetadata<TNode extends Node = Node> {
    readonly target?: TNode extends ChildNode ? View<TNode> | NodeHost<TNode> | NodeRef<TNode> | TNode : TNode;
    readonly signature?: string;
    readonly [key: string]: unknown;
}

/**
 * Creates a Task to mutate the DOM.
 *
 * @remarks
 * Invalidates Style or Layout.
 *
 * @param   operation - Function that mutates the DOM.
 * @param   metadata - Data used to identify the task.
 *
 * @returns Task to be scheduled.
 */
export function mutate<TNode extends Node = Node>(operation: () => void, metadata?: TaskMetadata<TNode>): Task {
    return {
        operation,
        queue: 'mutate',
        metadata,
    };
}

/**
 * Creates a Task to measure/read the DOM.
 *
 * @remarks
 * Calculates Style or Layout.
 *
 * @param   operation - Function that measures/reads the DOM.
 * @param   metadata - Data used to identify the task.
 *
 * @returns Task to be scheduled.
 */
export function measure<TNode extends Node = Node>(operation: () => void, metadata: TaskMetadata<TNode>): Task {
    return {
        operation,
        queue: 'measure',
        metadata,
    };
}
