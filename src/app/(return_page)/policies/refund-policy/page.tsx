import React from "react";
import { metadataDefault } from "@/components/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
    ...metadataDefault,
    title: "Refund Policy",
    description: "Learn about our refund and cancellation policy for bakery purchases. Understand your rights and our procedures for handling refund requests."
};

export default async function Page() {



    return (
        <div className="flex flex-col min-h-screen">
            <main className="z-10 grid container mx-auto py-6 gap-y-3 max-w-3xl">
                <p className={"text-3xl font-bold"}>
                    Refund Policy - TheBakerz
                </p>
                <p className={"font-light"}><em>Last updated: [10.11.2024]</em></p>
                <p className={"text-base"}>
                    At TheBakerz, we are committed to ensuring customer satisfaction with every purchase made through our
                    platform. This Refund Policy outlines the terms and conditions under which refunds are issued for
                    products purchased from sellers (Bakers) on our marketplace. Please read this policy carefully to
                    understand your rights and obligations.
                </p>
                <ul className={"grid gap-y-3"}>
                    <li className={"text-lg font-bold"}>
                        1. General Refund Guidelines
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                1.1.
                            </p>
                            <p>
                                <strong>Applicability: </strong>This Refund Policy applies to all purchases made by
                                consumers through TheBakerz platform in the Netherlands.
                            </p>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                1.2.
                            </p>
                            <p>
                                <strong>Consumer Rights: </strong>This policy complements your statutory rights under
                                Dutch consumer protection laws. Nothing in this policy limits your legal rights.
                            </p>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        2. Perishable Goods Policy
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                2.1.
                            </p>
                            <p>
                                <strong>Nature of Products: </strong>Most products sold on TheBakerz are perishable
                                goods with limited shelf life.
                            </p>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                2.2.
                            </p>
                            <p>
                                <strong>No Right of Withdrawal: </strong>Under Dutch law, the statutory right of
                                withdrawal (cooling-off period) does not apply to the supply of goods that are made
                                to the consumer&apos;s specifications or are highly perishable and likely to expire
                                quickly (Article 6:230p sub f of the Dutch Civil Code).
                            </p>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        3. Refund Eligibility
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                3.1.
                            </p>
                            <div>
                                Defective or Damaged Products:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If you receive a product that is defective, damaged, or not as described,
                                        you are entitled to a full refund or replacement.
                                    </li>
                                    <li>
                                        • Defects include spoilage upon receipt, incorrect items, or products
                                        that do not meet the agreed specifications.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                3.2.
                            </p>
                            <div>
                                Non-Delivery:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If the seller fails to deliver the product at the agreed time and location
                                        without a valid reason, you are entitled to a full refund.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                3.3.
                            </p>
                            <div>
                                Cancellations by Seller:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If the seller cancels your order, you will receive a full refund.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        4. Refund Exceptions
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                4.1.
                            </p>
                            <div>
                                Change of Mind:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Due to the custom and perishable nature of baked goods, refunds for change of
                                        mind are not accepted once the seller has begun preparation.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                4.2.
                            </p>
                            <div>
                                Late Cancellation:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If you cancel an order after the seller has begun preparation, you may not
                                        be eligible for a refund.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        5. Cancellation Policy
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                5.1.
                            </p>
                            <div>
                                Cancellation by Consumer:
                                <div className={"ml-6 grid gap-y-3"}>
                                    <p>
                                        • <strong>Before Preparation Begins:</strong>
                                    </p>
                                    <ul className={"ml-6 grid gap-y-3"}>
                                        <li>
                                            • You may cancel your order without any charges if the seller has not yet
                                            begun
                                            preparation.
                                        </li>
                                        <li>
                                            • To cancel, please notify the seller via the platform&apos;s messaging system or
                                            contact customer support immediately.
                                        </li>
                                    </ul>
                                    <p>
                                        • <strong>After Preparation Begins:</strong>
                                    </p>
                                    <ul className={"ml-6 grid gap-y-3"}>
                                        <li>
                                            • If you wish to cancel after preparation has started, please contact the
                                            seller. Refunds in such cases are at the seller&apos;s discretion.
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                5.2.
                            </p>
                            <div>
                                How to Cancel:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Log in to your account on TheBakerz platform.
                                    </li>
                                    <li>
                                        • Navigate to &quot;My Orders.&quot;
                                    </li>
                                    <li>
                                        • Select the order you wish to cancel.
                                    </li>
                                    <li>
                                        • Click on &quot;Cancel Order&quot; and follow the prompts.
                                    </li>
                                    <li>
                                        • Alternatively, contact customer support at <a
                                        href="mailto:support@thebakerz.com"
                                        className="text-grayText underline">support@thebakerz.com</a> for assistance.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        6. Refund Request Process
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                6.1.
                            </p>
                            <div>
                                Timeframe for Requests:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • You must submit a refund request within <strong>24 hours</strong> of
                                        receiving the product.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                6.2.
                            </p>
                            <div>
                                How to Submit a Request:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Contact the seller directly through the platform&apos;s messaging system.
                                    </li>
                                    <li>
                                        • Provide detailed information about the issue, including photos if applicable.
                                    </li>
                                    <li>
                                        • If the issue is not resolved with the seller, contact TheBakerz customer
                                        support at <a
                                        href="mailto:support@thebakerz.com"
                                        className="text-grayText underline">support@thebakerz.com</a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                6.3.
                            </p>
                            <div>
                                Required Information:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Order number and date.
                                    </li>
                                    <li>
                                        • Description of the issue.
                                    </li>
                                    <li>
                                        • Photographic evidence of defects or damages.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        7. Processing Refunds
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                7.1.
                            </p>
                            <div>
                                Assessment:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Upon receiving your refund request, the seller and TheBakerz will assess the
                                        claim.
                                    </li>
                                    <li>
                                        • You may be contacted for additional information or clarification.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                7.2.
                            </p>
                            <div>
                                Decision:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • You will be notified of the decision regarding your refund request within
                                        <strong>5 business days</strong>.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                7.3.
                            </p>
                            <div>
                                Refund Method:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Approved refunds will be issued to the original payment method used at
                                        the time of purchase.
                                    </li>
                                    <li>
                                        • Refunds may take <strong>5-10 business days</strong> to appear in your
                                        account, depending on your bank or payment provider.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        8. Dispute Resolution
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                8.1.
                            </p>
                            <div>
                                Unresolved Issues:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If you are not satisfied with the outcome of your refund request, you may
                                        escalate the issue to TheBakerz customer support.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                8.2.
                            </p>
                            <div>
                                Mediation:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • TheBakerz will act as a mediator between you and the seller to reach an
                                        amicable resolution.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                8.3.
                            </p>
                            <div>
                                External Resolution:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • If a resolution cannot be reached, you may seek external dispute resolution
                                        as outlined in our Terms and Conditions.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        9. Seller Obligations
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                9.1.
                            </p>
                            <div>
                                Quality Assurance:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Sellers are responsible for ensuring that products meet the quality and
                                        description specified at the time of purchase.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                9.2.
                            </p>
                            <div>
                                Timely Communication:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Sellers must respond promptly to refund requests and cooperate in resolving
                                        any issues.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                9.3.
                            </p>
                            <div>
                                Compliance:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Sellers must comply with all applicable laws and regulations,
                                        including those related to consumer rights and product safety.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        10. Customer Responsibilities
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                10.1.
                            </p>
                            <div>
                                Accurate Information:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Provide accurate and complete information when submitting a refund request.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                10.2.
                            </p>
                            <div>
                                Product Handling:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Handle and store products in accordance with any provided instructions to
                                        avoid spoilage or damage.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                10.3.
                            </p>
                            <div>
                                Good Faith:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • Submit refund requests in good faith. Fraudulent claims may result in account
                                        suspension.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        11. Limitation of Liability
                    </li>
                    <div className={"ml-6 grid gap-y-3"}>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                11.1.
                            </p>
                            <div>
                                Platform Role:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • TheBakerz acts as a marketplace platform connecting consumers and sellers.
                                        While we facilitate transactions, we are not the producer of the goods.
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className={"flex flex-row"}>
                            <p className={"font-bold mr-1"}>
                                11.2.
                            </p>
                            <div>
                                No Liability for Seller Actions:
                                <ul className={"ml-6 grid gap-y-3"}>
                                    <li>
                                        • TheBakerz is not liable for the actions or omissions of sellers but will
                                        assist in resolving disputes.
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </div>
                    <li className={"text-lg font-bold"}>
                        12. Contact Information
                    </li>
                    <li>
                        If you have any questions or need assistance with a refund or cancellation, please contact us:
                        <ul className={"ml-6 grid gap-y-3"}>
                            <li>
                                • <strong>Email: </strong><a href="mailto:support@thebakerz.com"
                                                             className="text-grayText underline">support@thebakerz.com</a>
                            </li>
                            <li>
                                • <strong>Phone: </strong><a href="tel:+31645422552"
                                                             className="text-grayText underline">+31 (0) 645422552</a>
                            </li>
                            <li>
                                • <strong>Address: </strong><a
                                href="https://maps.google.com/?q=Edmond+Jasparstraat+48a,+6217HB+Maastricht,+The+Netherlands"
                                target="_blank" className="text-grayText underline">Edmond Jasparstraat 48a, 6217HB
                                Maastricht, The Netherlands</a>
                            </li>
                        </ul>

                    </li>
                    <li className={"text-lg font-bold"}>
                        13. Changes to This Policy
                    </li>
                    <li>
                        TheBakerz reserves the right to modify this Refund Policy at any time. Changes will be effective
                        immediately upon posting on the platform. We encourage you to review this policy periodically.
                        <p className={"mt-6"}>
                            <strong>Note:</strong> This Refund Policy forms part of the Terms and Conditions of TheBakerz.
                            By making a purchase on our platform, you agree to this policy and our Terms and Conditions.
                        </p>

                    </li>
                </ul>
            </main>
        </div>
    );
}
