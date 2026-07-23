/**
 * @fileoverview Commented-out mock order data for the order dashboard.
 *
 * The entire file is disabled; it previously exported fakeOrdersProducts, an
 * array of sample OrderData objects used to test the dashboard UI. It
 * currently exports nothing.
 */
// import {OrderData} from "@/lib/actions/order";
//
// export const fakeOrdersProducts: OrderData[] = [
//     {
//         id: "order-123",
//         store_order_id: "1001",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "new",
//         createdAt: new Date(Date.now() - 43200000), // 12 hours ago
//         customer: {
//             email_customer: "john@example.com",
//             email_verified: false,
//             name_customer: "John Doe",
//             phone_number: "+1234567890"
//         },
//         amount: 49.98,
//         amount_tax: 8.67,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-15",
//             time: "14:00"
//         },
//         productsData: [
//             {
//                 id: "prod-1",
//                 name: "Chocolate Cake",
//                 qty: 2,
//                 price: 24.99,
//                 variants: [],
//                 const_id: "choc-cake",
//                 ingredients: ["chocolate", "flour", "sugar"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-456",
//         store_order_id: "1002",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "started",
//         createdAt: new Date(Date.now() - 86400000), // 1 day ago
//         customer: {
//             email_customer: "sarah@example.com",
//             email_verified: false,
//             name_customer: "Sarah Smith",
//             phone_number: "+1987654321"
//         },
//         amount: 39.99,
//         amount_tax: 6.94,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-16",
//             time: "10:30"
//         },
//         productsData: [
//             {
//                 id: "prod-3",
//                 name: "Birthday Cake",
//                 qty: 1,
//                 price: 39.99,
//                 variants: ["Happy Birthday Text"],
//                 const_id: "bday-cake",
//                 ingredients: ["vanilla", "flour", "sugar"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-789",
//         store_order_id: "1003",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "ready",
//         createdAt: new Date(Date.now() - 129600000), // 1.5 days ago
//         customer: {
//             email_customer: "michael@example.com",
//             email_verified: true,
//             name_customer: "Michael Johnson",
//             phone_number: "+1122334455"
//         },
//         amount: 35.88,
//         amount_tax: 6.23,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-14",
//             time: "16:45"
//         },
//         productsData: [
//             {
//                 id: "prod-4",
//                 name: "Vanilla Cupcakes",
//                 qty: 12,
//                 price: 2.99,
//                 variants: [],
//                 const_id: "van-cupcakes",
//                 ingredients: ["vanilla", "flour", "sugar"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-101",
//         store_order_id: "1004",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "completed",
//         createdAt: new Date(Date.now() - 172800000), // 2 days ago
//         customer: {
//             email_customer: "emily@example.com",
//             email_verified: false,
//             name_customer: "Emily Wilson",
//             phone_number: "+1555666777"
//         },
//         amount: 38.99,
//         amount_tax: 6.77,
//         completed: true,
//         scheduled_time: {
//             date: "2023-10-13",
//             time: "11:15"
//         },
//         productsData: [
//             {
//                 id: "prod-5",
//                 name: "Strawberry Shortcake",
//                 qty: 1,
//                 price: 29.99,
//                 variants: [],
//                 const_id: "straw-cake",
//                 ingredients: ["strawberry", "flour", "cream"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-6",
//                 name: "Cookies",
//                 qty: 6,
//                 price: 1.50,
//                 variants: ["Chocolate Chip"],
//                 const_id: "cookies",
//                 ingredients: ["flour", "sugar", "butter"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-202",
//         store_order_id: "1005",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "cancelled",
//         createdAt: new Date(Date.now() - 259200000), // 3 days ago
//         customer: {
//             email_customer: "david@example.com",
//             email_verified: false,
//             name_customer: "David Brown",
//             phone_number: "+1777888999"
//         },
//         amount: 34.99,
//         amount_tax: 6.08,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-12",
//             time: "13:30"
//         },
//         cancelledAt: new Date(Date.now() - 230000000),
//         productsData: [
//             {
//                 id: "prod-7",
//                 name: "Red Velvet Cake",
//                 qty: 1,
//                 price: 34.99,
//                 variants: [],
//                 const_id: "red-vel",
//                 ingredients: ["cocoa", "flour", "cream cheese"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-303",
//         store_order_id: "1006",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "new",
//         createdAt: new Date(Date.now() - 345600000), // 4 days ago
//         customer: {
//             email_customer: "jessica@example.com",
//             email_verified: true,
//             name_customer: "Jessica Taylor",
//             phone_number: "+1444555666"
//         },
//         amount: 42.99,
//         amount_tax: 7.46,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-11",
//             time: "15:00"
//         },
//         productsData: [
//             {
//                 id: "prod-8",
//                 name: "Cheesecake",
//                 qty: 1,
//                 price: 32.99,
//                 variants: ["New York Style"],
//                 const_id: "cheesecake",
//                 ingredients: ["cream cheese", "sugar", "graham crackers"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-9",
//                 name: "Brownies",
//                 qty: 4,
//                 price: 2.50,
//                 variants: [],
//                 const_id: "brownies",
//                 ingredients: ["chocolate", "flour", "sugar"],
//                 allergies: ["gluten", "dairy", "nuts"]
//             }
//         ]
//     },
//     {
//         id: "order-404",
//         store_order_id: "1007",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "started",
//         createdAt: new Date(Date.now() - 432000000), // 5 days ago
//         customer: {
//             email_customer: "robert@example.com",
//             email_verified: false,
//             name_customer: "Robert Martin",
//             phone_number: "+1222333444"
//         },
//         amount: 149.99,
//         amount_tax: 26.03,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-10",
//             time: "09:00"
//         },
//         productsData: [
//             {
//                 id: "prod-10",
//                 name: "Wedding Cake",
//                 qty: 1,
//                 price: 149.99,
//                 variants: ["3 Tier", "White Fondant"],
//                 const_id: "wedding-cake",
//                 ingredients: ["vanilla", "flour", "sugar", "fondant"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-505",
//         store_order_id: "1008",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "ready",
//         createdAt: new Date(Date.now() - 518400000), // 6 days ago
//         customer: {
//             email_customer: "amanda@example.com",
//             email_verified: false,
//             name_customer: "Amanda Clark",
//             phone_number: "+1888999000"
//         },
//         amount: 48.89,
//         amount_tax: 8.49,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-09",
//             time: "14:15"
//         },
//         productsData: [
//             {
//                 id: "prod-10",
//                 name: "Wedding Cake",
//                 qty: 1,
//                 price: 149.99,
//                 variants: ["3 Tier", "White Fondant"],
//                 const_id: "wedding-cake",
//                 ingredients: ["vanilla", "flour", "sugar", "fondant"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-123",
//         store_order_id: "1001",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "new",
//         createdAt: new Date(Date.now() - 43200000), // 12 hours ago
//         customer: {
//             email_customer: "john@example.com",
//             email_verified: false,
//             name_customer: "John Doe",
//             phone_number: "+1234567890"
//         },
//         amount: 49.98,
//         amount_tax: 8.67,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-15",
//             time: "14:00"
//         },
//         productsData: [
//             {
//                 id: "prod-1",
//                 name: "Chocolate Cake",
//                 qty: 2,
//                 price: 24.99,
//                 variants: [],
//                 const_id: "choc-cake",
//                 ingredients: ["chocolate", "flour", "sugar"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-456",
//         store_order_id: "1002",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "started",
//         createdAt: new Date(Date.now() - 86400000), // 1 day ago
//         customer: {
//             email_customer: "sarah@example.com",
//             email_verified: false,
//             name_customer: "Sarah Smith",
//             phone_number: "+1987654321"
//         },
//         amount: 39.99,
//         amount_tax: 6.94,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-16",
//             time: "10:30"
//         },
//         productsData: [
//             {
//                 id: "prod-3",
//                 name: "Birthday Cake",
//                 qty: 1,
//                 price: 39.99,
//                 variants: ["Happy Birthday Text"],
//                 const_id: "bday-cake",
//                 ingredients: ["vanilla", "flour", "sugar"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-789",
//         store_order_id: "1003",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "ready",
//         createdAt: new Date(Date.now() - 129600000), // 1.5 days ago
//         customer: {
//             email_customer: "michael@example.com",
//             email_verified: true,
//             name_customer: "Michael Johnson",
//             phone_number: "+1122334455"
//         },
//         amount: 35.88,
//         amount_tax: 6.23,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-14",
//             time: "16:45"
//         },
//         productsData: [
//             {
//                 id: "prod-4",
//                 name: "Vanilla Cupcakes",
//                 qty: 12,
//                 price: 2.99,
//                 variants: [],
//                 const_id: "van-cupcakes",
//                 ingredients: ["vanilla", "flour", "sugar"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-101",
//         store_order_id: "1004",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "completed",
//         createdAt: new Date(Date.now() - 172800000), // 2 days ago
//         customer: {
//             email_customer: "emily@example.com",
//             email_verified: false,
//             name_customer: "Emily Wilson",
//             phone_number: "+1555666777"
//         },
//         amount: 38.99,
//         amount_tax: 6.77,
//         completed: true,
//         scheduled_time: {
//             date: "2023-10-13",
//             time: "11:15"
//         },
//         productsData: [
//             {
//                 id: "prod-5",
//                 name: "Strawberry Shortcake",
//                 qty: 1,
//                 price: 29.99,
//                 variants: [],
//                 const_id: "straw-cake",
//                 ingredients: ["strawberry", "flour", "cream"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-6",
//                 name: "Cookies",
//                 qty: 6,
//                 price: 1.50,
//                 variants: ["Chocolate Chip"],
//                 const_id: "cookies",
//                 ingredients: ["flour", "sugar", "butter"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-202",
//         store_order_id: "1005",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "cancelled",
//         createdAt: new Date(Date.now() - 259200000), // 3 days ago
//         customer: {
//             email_customer: "david@example.com",
//             email_verified: false,
//             name_customer: "David Brown",
//             phone_number: "+1777888999"
//         },
//         amount: 34.99,
//         amount_tax: 6.08,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-12",
//             time: "13:30"
//         },
//         cancelledAt: new Date(Date.now() - 230000000),
//         productsData: [
//             {
//                 id: "prod-7",
//                 name: "Red Velvet Cake",
//                 qty: 1,
//                 price: 34.99,
//                 variants: [],
//                 const_id: "red-vel",
//                 ingredients: ["cocoa", "flour", "cream cheese"],
//                 allergies: ["gluten", "dairy"]
//             }
//         ]
//     },
//     {
//         id: "order-303",
//         store_order_id: "1006",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "new",
//         createdAt: new Date(Date.now() - 345600000), // 4 days ago
//         customer: {
//             email_customer: "jessica@example.com",
//             email_verified: true,
//             name_customer: "Jessica Taylor",
//             phone_number: "+1444555666"
//         },
//         amount: 42.99,
//         amount_tax: 7.46,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-11",
//             time: "15:00"
//         },
//         productsData: [
//             {
//                 id: "prod-8",
//                 name: "Cheesecake",
//                 qty: 1,
//                 price: 32.99,
//                 variants: ["New York Style"],
//                 const_id: "cheesecake",
//                 ingredients: ["cream cheese", "sugar", "graham crackers"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-9",
//                 name: "Brownies",
//                 qty: 4,
//                 price: 2.50,
//                 variants: [],
//                 const_id: "brownies",
//                 ingredients: ["chocolate", "flour", "sugar"],
//                 allergies: ["gluten", "dairy", "nuts"]
//             }
//         ]
//     },
//     {
//         id: "order-404",
//         store_order_id: "1007",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "started",
//         createdAt: new Date(Date.now() - 432000000), // 5 days ago
//         customer: {
//             email_customer: "robert@example.com",
//             email_verified: false,
//             name_customer: "Robert Martin",
//             phone_number: "+1222333444"
//         },
//         amount: 149.99,
//         amount_tax: 26.03,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-10",
//             time: "09:00"
//         },
//         productsData: [
//             {
//                 id: "prod-10",
//                 name: "Wedding Cake",
//                 qty: 1,
//                 price: 149.99,
//                 variants: ["3 Tier", "White Fondant"],
//                 const_id: "wedding-cake",
//                 ingredients: ["vanilla", "flour", "sugar", "fondant"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-505",
//         store_order_id: "1008",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "ready",
//         createdAt: new Date(Date.now() - 518400000), // 6 days ago
//         customer: {
//             email_customer: "amanda@example.com",
//             email_verified: false,
//             name_customer: "Amanda Clark",
//             phone_number: "+1888999000"
//         },
//         amount: 48.89,
//         amount_tax: 8.49,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-09",
//             time: "14:15"
//         },
//         productsData: [
//             {
//                 id: "prod-11",
//                 name: "Fruit Tart",
//                 qty: 2,
//                 price: 18.95,
//                 variants: [],
//                 const_id: "fruit-tart",
//                 ingredients: ["pastry", "cream", "fresh fruit"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-12",
//                 name: "Macarons",
//                 qty: 6,
//                 price: 1.83,
//                 variants: ["Assorted"],
//                 const_id: "macarons",
//                 ingredients: ["almond flour", "sugar", "egg whites"],
//                 allergies: ["nuts", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-606",
//         store_order_id: "1009",
//         store_id: "store-1",
//         status: 'paid',
//         order_status: "completed",
//         createdAt: new Date(Date.now() - 604800000), // 7 days ago
//         customer: {
//             email_customer: "kevin@example.com",
//             email_verified: false,
//             name_customer: "Kevin Lee",
//             phone_number: "+1333222111"
//         },
//         amount: 45.00,
//         amount_tax: 7.81,
//         completed: true,
//         scheduled_time: {
//             date: "2023-10-08",
//             time: "16:30"
//         },
//         productsData: [
//             {
//                 id: "prod-13",
//                 name: "Tiramisu",
//                 qty: 2,
//                 price: 22.50,
//                 variants: [],
//                 const_id: "tiramisu",
//                 ingredients: ["mascarpone", "coffee", "ladyfingers"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     },
//     {
//         id: "order-707",
//         store_order_id: "1010",
//         store_id: "store-1",
//         status: 'manual',
//         order_status: "cancelled",
//         createdAt: new Date(Date.now() - 691200000), // 8 days ago
//         customer: {
//             email_customer: "lisa@example.com",
//             email_verified: false,
//             name_customer: "Lisa Anderson",
//             phone_number: "+1666777888"
//         },
//         amount: 50.99,
//         amount_tax: 8.85,
//         completed: false,
//         scheduled_time: {
//             date: "2023-10-07",
//             time: "10:45"
//         },
//         cancelledAt: new Date(Date.now() - 680000000),
//         productsData: [
//             {
//                 id: "prod-14",
//                 name: "Black Forest Cake",
//                 qty: 1,
//                 price: 36.99,
//                 variants: [],
//                 const_id: "black-forest",
//                 ingredients: ["chocolate", "cherry", "cream"],
//                 allergies: ["gluten", "dairy"]
//             },
//             {
//                 id: "prod-15",
//                 name: "Cake Pops",
//                 qty: 8,
//                 price: 1.75,
//                 variants: ["Assorted"],
//                 const_id: "cake-pops",
//                 ingredients: ["cake", "frosting", "chocolate"],
//                 allergies: ["gluten", "dairy", "eggs"]
//             }
//         ]
//     }
// ];
//
//
