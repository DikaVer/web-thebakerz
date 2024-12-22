interface FAQ {
  title: string;
  content: string;
}

const faqsBakerz: FAQ[] = [
  {
    title: "What is TheBakerz?",
    content: `
TheBakerz is an all-in-one platform that helps bakers manage their businesses and reach more customers. It handles orders, production planning, payments, and customer communication in one place. This means less time on admin and more time doing what you love—baking!
    `,
  },
  {
    title: "How do I start selling on TheBakerz?",
    content: `
Getting started is easy! Fill out this form (link), and we’ll schedule a quick call to set everything up. We’ll help you create your online shop and show you how to use it step by step.
    `,
  },
  {
    title: "What do I need to get started?",
    content: `
You’ll just need a KVK number, VAT number, and food safety certification. If you’re missing something, don’t worry—we’ll help you figure it out.
    `,
  },
  {
    title: "Can I choose my own prices and menu?",
    content: `
Of course! You’re in control of what you sell and how much you charge. You can update your menu and prices whenever you like.
    `,
  },
  {
    title: "How do orders and delivery work?",
    content: `
You decide what works best for your bakery. You can offer delivery or allow customers to pick up orders from your location. Set your own delivery areas and pickup times to fit your schedule.
    `,
  },
  {
    title: "What does it cost to use TheBakerz?",
    content: `
It’s €29.99 per month for hosting and a 5% commission per sale to cover payment processing. The first three months are free, so you can try it out without risk.
    `,
  },
  {
    title: "How do payments work?",
    content: `
Customers pay upfront through our secure payment system. We transfer your earnings, minus the commission, to your bank account weekly. Payments typically arrive within 1-2 business days.
    `,
  },
  {
    title: "Is it easy to use if I’m not good with technology?",
    content: `
Absolutely! TheBakerz is designed to be simple and user-friendly. If you ever need help, our support team is just an email or call away.
    `,
  },
  {
    title: "Can I trust TheBakerz with payments and orders?",
    content: `
Yes, you can. Orders are tracked automatically, and payments are processed securely. Both you and your customers will have full transparency at every step.
    `,
  },
  {
    title: "What kind of support does TheBakerz offer?",
    content: `
We’re here to help with anything you need. From setting up your shop to managing orders, [contact us](/support/contact-us) or call us at +31 684794739. We’ll make sure everything runs smoothly for you.
    `,
  },
];

const faqsCustomer: FAQ[] = [
  {
    title: "How do I place an order on TheBakerz?",
    content: `
Visit [www.thebakerz.com](http://www.thebakerz.com) to browse local bakeries. Add items to your cart, customize your order if needed, and checkout securely. You’ll receive a confirmation email once your order is placed.
    `,
  },
  {
    title: "How do I pick up my order or arrange delivery?",
    content: `
Choose a pickup time or delivery option during checkout. Bakers will provide all the necessary details. If you need to make changes, use our messaging system to contact the baker directly.
    `,
  },
  {
    title: "Can I customize my order or request special dietary options?",
    content: `
Yes! Many bakers offer customization for flavors or decorations and cater to dietary needs like gluten-free or vegan options. Just add your preferences during checkout or message the baker for special requests.
    `,
  },
  {
    title: "What is the refund and cancellation policy?",
    content: `
Refunds are available for defective or incorrect orders within 24 hours of receiving them. You can cancel an order before the baker starts preparing it. For help, [contact us](/support/contact-us).
    `,
  },
  {
    title: "How do I communicate with the baker?",
    content: `
Log in to your account and use the messaging feature on your order details page. This allows you to confirm details, ask questions, or discuss pick-up/delivery arrangements.
    `,
  },
  {
    title: "How are payments handled? Is it secure?",
    content: `
All payments are processed securely through our trusted gateway. You can pay using major credit or debit cards, and we ensure your information is kept safe.
    `,
  },
];

export { faqsBakerz, faqsCustomer };