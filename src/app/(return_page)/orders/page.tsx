/**
 * @fileoverview Customer order history page at /orders.
 *
 * Server component that redirects unauthenticated visitors to /auth, fetches
 * the current user's orders via getUserOrders, and renders them with
 * OrdersList. Metadata marks the page as noindex.
 */
import { Metadata } from "next";
import { getCurrentSession } from "@/lib/actions/session";
import { getUserOrders } from "@/lib/actions/user-orders";
import { OrdersList } from "@/components/order-user/order-list";
import { redirect } from "next/navigation";

const pageTitle = "My Orders | TheBakerz";
const pageDescription = "Track your orders, view past purchases with TheBakerz.";
const pageUrl = "https://www.thebakerz.com/orders";

export const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    robots: {
        index: false,
        follow: false
    },
    alternates: {
        canonical: pageUrl,
    },
    openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: pageUrl,
        type: 'website',
        siteName: 'TheBakerz',
    },
    twitter: {
        card: 'summary',
        title: pageTitle,
        description: pageDescription,
    }
};

export default async function Page() {
    // Check if user is logged in
    const { user } = await getCurrentSession();
    
    if (!user) {
        redirect("/auth?next=/orders");
    }
    
    // Fetch user orders
    const orders = await getUserOrders();
    
    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center px-4 py-8">
            <OrdersList orders={orders} />
        </div>
    );
}