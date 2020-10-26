import { ViewChange } from './ViewChange';
import { ViewChildControl } from './ViewChildControl';
import { ViewChildKey } from './ViewChildKey';

/**
 * A Map of ViewChildKey, ViewChildControl factory pairs.
 * Describes a view composed by an ordered collection of ViewChildControl factories each identified by a unique key.
 *
 * @typeParam   TChildNode - The ViewControls child nodes type.
 */
export type ViewMap<TChildNode extends ChildNode> = ReadonlyMap<ViewChildKey, () => ViewChildControl<TChildNode>>;

/**
 * Compares two ViewMaps and returns an array of ViewChange commands
 * required to transition `from` the first view state `to` the other.
 *
 * @param   from - The current view child controls list.
 * @param   to - The new view child controls list.
 *
 * @returns The ViewChange commands to transition the view state and DOM.
 */
export function getViewChanges<TChildNode extends ChildNode>(
    from: ViewMap<TChildNode>,
    to: ViewMap<TChildNode>,
): ViewChange<TChildNode>[] {
    const toArray = Array.from(to);
    const fromArray = Array.from(from);
    const movedView = new Set();

    const actions: ViewChange<TChildNode>[] = [];
    const start = toArray.length - 1;
    for (let i = start; i > -1; i--) {
        const [key, viewControlFactory] = toArray[i];
        const exists = from.has(key);

        if (!exists) {
            // add 'insert' command
            actions.push({
                type: 'insert',
                childControl: viewControlFactory(),
                childKey: key,
                refChildKey: toArray[i + 1]?.[0],
            });
        } else {
            let lastKeptChildKey = fromArray[fromArray.length - 1][0];
            let moved = false;
            while (!to.has(lastKeptChildKey) || (moved = movedView.has(lastKeptChildKey))) {
                fromArray.pop();
                if (!moved) {
                    // add 'remove' command
                    actions.push({ type: 'remove', childKey: lastKeptChildKey });
                }
                lastKeptChildKey = fromArray[fromArray.length - 1][0];
                moved = false;
            }

            if (lastKeptChildKey != key) {
                // add 'move' command
                actions.push({
                    type: 'move',
                    childKey: key,
                    refChildKey: toArray[i + 1]?.[0],
                });

                movedView.add(key);
            } else {
                fromArray.pop();
            }
        }
    }

    // Remove remaining views
    let nextView;
    while ((nextView = fromArray.pop())) {
        actions.push({ type: 'remove', childKey: nextView[0] });
    }

    return actions;
}
