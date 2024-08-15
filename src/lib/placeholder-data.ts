const stores = [
    {
        name: 'Mrs.Bombochka',
        description: "Nestled in the heart of the city, Sugar Blossom Bakery offers a delightful array of handmade pastries and desserts. Known for its cozy, inviting atmosphere and friendly service, this charming bakery specializes in classic treats with a modern twist, such as lavender-infused scones and salted caramel eclairs. Each item is meticulously crafted using only the finest ingredients, making Sugar Blossom a beloved spot for both locals and visitors.",
        email: 'info@thebakerz.com',
        phone_number: '555-555-5555',
        addresses: 'Sugar Lane',
        avatar_url: '/avatars/store_1.jpg',
        background_url: '/background_test.jpg',
    },
    {
        name: 'Mrs.Delicious',
        description: "Le Petit Chou is a quaint patisserie that brings a slice of Paris to its neighborhood. With its elegant décor and authentic French ambiance, this shop serves up a variety of exquisite pastries, from flaky croissants to rich, decadent tarts. The patisserie is particularly famous for its vibrant macarons and seasonal fruit galettes, which are as visually stunning as they are delicious. It’s the perfect place for anyone looking to indulge in a gourmet treat.",
        email: 'info@thebakerz.com',
        phone_number: '555-555-5555',
        addresses: 'Patisserie Place',
        avatar_url: '/avatars/store_2.jpg',
        background_url: '/background_test.jpg',
    },
    {
        name: 'Mr.CakeMaster',
        description: "The Doughnut Den is a vibrant, fun-filled shop that stands out for its creative approach to artisanal doughnuts. With an ever-changing menu featuring everything from maple bacon to matcha-glazed creations, this shop is a paradise for doughnut enthusiasts. The lively, colorful setting complements the innovative flavors, and the use of high-quality, locally-sourced ingredients ensures each doughnut is a fresh, flavorful experience.",
        email: 'info@thebakerz.com',
        phone_number: '555-555-5555',
        addresses: 'Doughnut Drive',
        avatar_url: '/avatars/store_2.jpg',
        background_url: '/background_test.jpg',
    },
];

const categories = [
    {
        name: 'Cakes',
    },
    {
        name: 'Pastries',
    },
    {
        name: 'Bread',
    },
    {
        name: 'Cupcakes',
    },
    {
        name: 'Cookies',
    },
    {
        name: 'Pies',
    },
    {
        name: 'Macarons',
    },
    {
        name: 'Doughnuts',
    },
];

const products = [
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Cakes',
        name: 'Chocolate Cake',
        description: 'Indulge in this decadent chocolate cake, made with premium ingredients. Award-winning recipe, perfected over years to bring you the ultimate dessert experience.',
        price: 250,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Cakes',
        name: 'Vanilla Cake',
        description: 'A classic vanilla cake with a rich and creamy filling.',
        price: 200,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Cakes',
        name: 'Strawberry Cake',
        description: 'A light and fluffy strawberry cake, bursting with fresh fruit flavors.',
        price: 225,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Pastries',
        name: 'Chocolate Eclair',
        description: 'A classic French pastry filled with rich chocolate cream and topped with a glossy chocolate glaze.',
        price: 150,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Pastries',
        name: 'Lemon Tart',
        description: 'A zesty lemon tart with a buttery shortcrust pastry and a tangy lemon curd filling.',
        price: 175,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Pastries',
        name: 'Fruit Danish',
        description: 'A flaky pastry filled with seasonal fruits and a sweet glaze.',
        price: 125,
        image_url: '/macaroons_test.jpg',
    },
    {
        store_id: 'Mrs.Bombochka',
        category_id: 'Bread',
        name: 'Sourdough Loaf',
        description: 'A rustic sourdough loaf with a chewy crust and a soft, tangy crumb.',
        price: 300,
        image_url: '/macaroons_test.jpg',
    }];

export { stores, categories, products};