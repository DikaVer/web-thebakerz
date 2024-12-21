// faqs.ts

interface FAQ {
  title: string;
  content: string;
}

const faqsBakerz: FAQ[] = [
  {
    title: "How do I start selling my baked goods on TheBakerz?",
    content: `
**Sign Up**  
- Visit [www.thebakerz.com](/) and click on "Become a Seller."  
- Fill out the registration form with your basic information.

**Provide Necessary Documents**  
- **KVK Registration Number**: Proof that your business is registered.  
- **VAT (BTW) Number**: For tax purposes.  
- **Food Safety Compliance**: Documents like HACCP certification to show that you follow food safety regulations.  

*Tip*: If you are missing some of the documents, [contact us](/support/contact-us). We will help you be fully set.

**Set Up Your Shop With Our Help**  
- Create a profile for your bakery with a friendly description.  
- Upload attractive photos of your baked goods.  
- Add product details like names, prices, and descriptions.  
*Tip*: We will review your shop and help you if you have any questions.

**Start Selling**  
- Once your account is verified, your shop will be live.  
- Customers can now find and order your delicious creations!  
- Add the link to your shop on your social media (Instagram, Facebook, etc.)

**Need Help?**  
Don't worry if you're unsure about any steps. Our team is here to assist you throughout the process.
    `,
  },
  {
    title: "What documents do I need, and why are they important?",
    content: `
**KVK Registration Number** - Confirms your business is officially registered in the Netherlands.  

**VAT (BTW) Number** - Required for tax compliance.  

**Food Safety Compliance**  
- To ensure all food sold is safe for customers.  
- *Examples:* HACCP certification or food hygiene training certificates.  

These documents help build trust with customers and comply with Dutch regulations. If you need assistance obtaining them, we're happy to guide you!
    `,
  },
  {
    title: "How does delivery and pick-up work on TheBakerz?",
    content: `
**Baker-Managed Delivery**  
- You can offer delivery services yourself within your local area.  
- Set your own delivery fees and conditions.

**Customer Pick-Up**  
- Allow customers to pick up orders directly from your bakery or specified location.  
- Specify pick-up times and any instructions in your shop settings.

**Flexibility**  
- Choose the options that work best for you and your customers.  
- Make sure to clearly communicate your delivery or pick-up details on your shop page.
    `,
  },
  {
    title: "What fees does TheBakerz charge?",
    content: `
**Commission on Sales**  
- A small commission of 10% on each sale made through the platform.  
- This helps us maintain and improve the platform for your benefit and cover all payment processing fees.

**Optional Monthly Subscription (€29.99/month)**  
- Access premium features like advanced sales analytics and promotional tools.  
- This is entirely optional and can be opted into at any time.

**No Hidden Fees**  
- No setup fees or listing fees.  
- All fees are clearly detailed in your seller dashboard.

Our goal is to support your business growth without burdening you with high costs.
    `,
  },
  {
    title: "How and when do I get paid for my sales?",
    content: `
**Secure Transactions**  
- Customers pay at the time they place an order through our secure payment system.

**Earnings Deposited**  
- After you fulfill an order, your earnings (minus our commission) are processed.

**Payout Schedule**  
- Payments are transferred to your bank account every week.  
- It may take 1-2 business days for the funds to appear, depending on your bank.

**Setting Up Payments**  
- Add your bank account details in your seller profile.  
- Ensure the information is accurate to avoid any delays.

**Transparency**  
- You can track all your sales and payouts in your seller dashboard.
    `,
  },
  {
    title: "What kind of support does TheBakerz offer to help me succeed?",
    content: `
**Dedicated Support Team**  
- Reach out to us at [sellersupport@thebakerz.com](mailto:sellersupport@thebakerz.com) with any questions.  
- We're ready to assist with technical issues, account questions, or general inquiries.

**Account Management Assistance**  
- Personalized help to optimize your shop setup.  
- Guidance on best practices for listing your products effectively.

**Order Management Support**  
- Tools to help you efficiently manage and track your orders.  
- Assistance with handling peak times and ensuring timely fulfillment.

**Feedback and Improvement**  
- Receive constructive feedback from our team to enhance your product offerings and customer service.  
- Opportunities to suggest platform improvements that can benefit your business.

**Resources and Guides**  
- Access helpful articles and tips on setting up your shop, marketing your products, and more.  
- Learn best practices to enhance your online presence.

**Community Engagement**  
- Join our community forums to connect with other bakers.  
- Share experiences, advice, and inspiration.

**Promotional Opportunities**  
- Benefit from platform-wide marketing campaigns.  
- Feature your products in special promotions and seasonal events.

Your Success Matters: We're committed to providing the tools and assistance you need to thrive on TheBakerz platform. Don't hesitate to reach out—we're here to help you every step of the way!
    `,
  },
  {
    title: "Can I set my own prices and choose what to sell?",
    content: `
**Pricing**  
- Set prices that reflect the value of your products.  
- Adjust prices anytime to run promotions or respond to market trends.

**Product Selection**  
- Offer the baked goods you specialize in.  
- Update your menu whenever you like with new creations.

We believe in empowering you to run your bakery your way!
    `,
  },
  {
    title: "How do I manage orders and communicate with customers?",
    content: `
**Order Management**  
- Receive notifications for new orders.  
- Track and update order statuses in your dashboard.

**Customer Communication**  
- Use our integrated messaging system to:  
  - Confirm order details.  
  - Arrange pick-up times or delivery specifics.  
  - Answer any customer questions.

Clear communication leads to happy customers and repeat business.
    `,
  },
  {
    title: "What are my responsibilities regarding food safety and quality?",
    content: `
**Food Safety Compliance**  
- Follow all Dutch food safety laws and guidelines.  
- Maintain a clean and hygienic baking environment.

**Product Quality**  
- Ensure your baked goods match their descriptions and photos.  
- Clearly list ingredients and potential allergens.

**Consistency**  
- Strive to deliver the same great quality every time.  
- By upholding high standards, you build trust and encourage customers to return.
    `,
  },
  {
    title: "How does TheBakerz help promote my bakery?",
    content: `
**Marketplace Visibility**  
- Your shop is part of our marketplace, accessible to all visitors.

**Marketing Efforts**  
- We promote TheBakerz through various channels, attracting more customers to the platform.

**Promotional Tools**  
- Use features like featured products and special offers to stand out.

**Customer Reviews**  
- Positive reviews from happy customers boost your reputation.

Together, we can help your business reach new customers and grow.
    `,
  },
];

const faqsCustomer: FAQ[] = [

  {
    title: "How do I place an order on TheBakerz?",
    content: `
**Browse Products**  
- Visit [www.thebakerz.com](http://www.thebakerz.com) and browse through the wide range of baked goods available from local bakers.

**Select Your Items**  
- Click on the items you like, read the descriptions, and add them to your cart.

**Customize Your Order (if applicable)**  
- Some bakers offer customization options like flavor choices, special decorations, or dietary modifications.

**Checkout**  
- Once you’re ready, go to your cart, review your order, and proceed to checkout.  
- Enter your contact details and choose your preferred pick-up or delivery option.

**Confirm Payment**  
- Complete your order by paying through our secure payment system.

**Order Confirmation**  
- You’ll receive an order confirmation via email with all the details.
    `,
  },
  {
    title: "How do I pick up my order or arrange delivery?",
    content: `
**Pick-Up**  
- Check the pick-up details provided by the baker during checkout.  
- Follow any instructions given for pick-up time and location.

**Baker-Managed Delivery**  
- If the baker offers delivery, they will handle it directly.  
- Make sure to check the delivery area and any applicable fees when ordering.

*Tip*: Contact the baker through our messaging system if you need to adjust pick-up times or delivery details.
    `,
  },
  {
    title: "Can I customize my order or request special dietary options?",
    content: `
**Customization**  
- Select items that have customization options like flavor changes or special decorations.

**Dietary Preferences**  
- Look for products labeled as gluten-free, vegan, nut-free, or any other specific dietary needs.

**How to Request**  
- Add customization requests during checkout or message the baker directly for special instructions.

**Note**  
- Availability of customization may vary by baker, so be sure to review product descriptions.
    `,
  },
  {
    title: "What is the refund and cancellation policy?",
    content: `
**Refunds**  
- If your order is defective, incorrect, or not as described, you can request a refund within 24 hours of receiving it.

**Cancellations**  
- You can cancel your order before the baker begins preparing it.  
- If preparation has already started, cancellations may not be possible.

**How to Request a Refund or Cancellation**  
- Contact the baker directly through our messaging system or reach out to [support@thebakerz.com](mailto:support@thebakerz.com).

**More Details**  
- Check our full Refund Policy for specific conditions.
    `,
  },
  {
    title: "How do I communicate with the baker?",
    content: `
**Messaging System**  
- Log in to your TheBakerz account and go to your order details.  
- Use the integrated chat feature to send a message to the baker.

**Purpose of Communication**  
- Confirm order details, ask questions, or discuss pick-up or delivery arrangements.

**Response Time**  
- Bakers typically respond within 24 hours, but most try to get back to you as soon as possible.
    `,
  },
  {
    title: "How are payments handled? Is it secure?",
    content: `
**Payment Options**  
- You can pay using major credit cards, debit cards, and other popular payment methods.

**Secure Processing**  
- All payments are processed through a secure payment gateway to ensure the safety of your personal and financial information.

**Order Confirmation**  
- Once your payment is completed, you will receive a confirmation email with the details of your purchase.

**Privacy**  
- Your data is handled in accordance with our [Privacy Policy](http://www.thebakerz.com/privacy).
    `,
  },
  {
    title: "What if I have an issue with my order?",
    content: `
**Common Issues**  
- Product not as described.  
- Damaged or spoiled goods.  
- Incorrect item received.

**Steps to Take**  
- **Contact the Baker**: Reach out to the baker through the messaging system to report the issue.  
- **Customer Support**: If you don’t receive a timely resolution, email [support@thebakerz.com](mailto:support@thebakerz.com) for assistance.

**Resolution Time**  
- We aim to resolve issues as quickly as possible, typically within 3-5 business days.
    `,
  },
  {
    title: "How do I leave a review for my order?",
    content: `
**Review Process**  
- Log in to your TheBakerz account.  
- Go to “My Orders” and select the completed order you want to review.  
- Leave a rating and write a brief review about your experience.

**Why Review?**  
- Your feedback helps bakers improve and allows other customers to make informed decisions.

*Tip*: Be honest and constructive with your reviews to support the community.
    `,
  },
  {
    title: "What safety measures do bakers follow?",
    content: `
**Food Safety Compliance**  
- All bakers must follow food safety regulations outlined by the Nederlandse Voedsel- en Warenautoriteit (NVWA).

**Hygiene Standards**  
- Bakers are required to maintain clean preparation environments and meet food safety standards.

**Transparency**  
- Each baker provides information on their adherence to these standards.  
- Feel free to contact them if you have specific questions or concerns.
    `,
  },
  {
    title: "How do I find items that fit my dietary needs?",
    content: `
**Search Filters**  
- Use filters on the platform to search for gluten-free, vegan, nut-free, or other specific dietary products.

**Product Labels**  
- Check product descriptions for detailed ingredient information and allergen warnings.

*Tip*: If you have a severe allergy or special dietary need, message the baker directly to confirm the ingredients.
    `,
  },
];


export {faqsBakerz, faqsCustomer};
