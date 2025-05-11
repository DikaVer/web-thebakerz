import { Metadata } from "next";
import { getCurrentSession } from "@/lib/actions/session";
import { getUserOrders } from "@/lib/actions/user-orders";
import { OrdersList } from "@/components/order-user/order-list";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Orders | TheBakerz",
    description: "Manage and track your bakery orders",
    robots: {
        index: false,
        follow: false
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