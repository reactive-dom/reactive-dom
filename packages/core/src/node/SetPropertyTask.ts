import { NodeRef, Task } from '@reactive-dom/api';

/**
 * DomScheduler Task that writes a property on a node.
 *
 * @typeParam   TNode - The node type.
 *
 * @internal
 */
export class SetPropertyTask<TNode extends ChildNode> implements Task {
    private nodeRef: NodeRef<TNode>;
    private propertyName: string;
    private value: unknown;

    public queue = 'mutate';

    /**
     * Creates an instance of SetPropertyTask.
     *
     * @param   nodeRef - The node reference object.
     * @param   propertyName - Name of property to set.
     * @param   value - The value to assign to the node property.
     */
    public constructor(nodeRef: NodeRef<TNode>, propertyName: string, value: unknown) {
        this.nodeRef = nodeRef;
        this.propertyName = propertyName;
        this.value = value;
    }

    public operation(): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.nodeRef.node as any)[this.propertyName] = this.value;
    }

    public get metadata(): { target: unknown; signature: string } {
        return {
            target: this.nodeRef,
            signature: `setProperty: ${this.propertyName}`,
        };
    }
}
