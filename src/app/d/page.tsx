/**
 * @fileoverview Redirect page at /d that forwards visitors to /socials.
 *
 * Server component page whose only behavior is an immediate server-side
 * redirect to the social links page.
 */
import { redirect } from "next/navigation";

// Media Page component
export default async function Page() {

    return redirect("/socials");

}
