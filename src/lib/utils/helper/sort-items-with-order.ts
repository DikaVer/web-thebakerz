/**
 * @fileoverview Generic helper for sorting items according to an explicit id order list.
 *
 * Exports sortItems, which orders items by their position in a given array of
 * ids, places items found in the order list before those that are not, and
 * applies an optional fallback comparator for items missing from the list.
 */
// Generic sort function using an order list
export function sortItems<T>(
    items: T[],
    order: string[],
    getId: (item: T) => string,
    fallbackSort?: (a: T, b: T) => number // optional fallback sort if neither item is in the order list
): T[] {
    return items.sort((a, b) => {
        const idA = getId(a);
        const idB = getId(b);
        const indexA = order.indexOf(idA);
        const indexB = order.indexOf(idB);

        // Both items are in the order list: sort by the defined order
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        // Only one item is in the order list: that one comes first
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // Neither item is in the order list.
        // Use fallback sort if provided (for example, alphabetical by name/title)
        if (fallbackSort) {
            return fallbackSort(a, b);
        }

        // Otherwise, leave them unchanged relative to each other
        return 0;
    });
}
