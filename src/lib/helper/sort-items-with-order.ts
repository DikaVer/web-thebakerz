// // Define your types
// type Category = {
//     id: string;
//     name: string;
// };
//
// type Product = {
//     id: string;
//     title: string;
//     // other product properties
// };
//
// // Sample data
// const categories: Category[] = [
//     { id: "cat3", name: "Category 3" },
//     { id: "cat1", name: "Category 1" },
//     { id: "cat2", name: "Category 2" },
//     { id: "catX", name: "Extra Category" }
// ];
//
// // Define the desired order for some categories
// const categoryOrder: string[] = ["cat1", "cat2", "cat3"];

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

// // Sorting categories using the generic function
// const sortedCategories = sortItems<Category>(
//     categories,
//     categoryOrder,
//     (category) => category.id,
//     (a, b) => a.name.localeCompare(b.name)
// );
//
// console.log("Sorted Categories:", sortedCategories);
//
// // Similarly, for products:
// const products: Product[] = [
//     { id: "prod2", title: "Product 2" },
//     { id: "prod1", title: "Product 1" },
//     { id: "prodX", title: "Extra Product" }
// ];
//
// const productOrder: string[] = ["prod1", "prod2"];
//
// const sortedProducts = sortItems<Product>(
//     products,
//     productOrder,
//     (product) => product.id,
//     (a, b) => a.title.localeCompare(b.title)
// );
//
// console.log("Sorted Products:", sortedProducts);
