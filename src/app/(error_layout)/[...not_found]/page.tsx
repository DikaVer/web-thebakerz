/**
 * @fileoverview Catch-all route that triggers the 404 page for unknown URLs.
 *
 * Matches any path not handled by other routes within the (error_layout)
 * group and calls Next.js notFound() so the nearest not-found boundary is
 * rendered.
 */
import {notFound} from "next/navigation"

export default function NotFoundCatchAll() {
    notFound()
}