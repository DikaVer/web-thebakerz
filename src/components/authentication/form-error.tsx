/**
 * @fileoverview Inline error message banner for authentication forms.
 *
 * Exports the FormError component, which renders a destructive-styled alert
 * box with a warning icon and the given message, or nothing when no message is
 * provided.
 */
import {
    ExclamationTriangleIcon
} from "@radix-ui/react-icons";

interface FormErrorProps {
    message?: string
}

export function FormError({message}: FormErrorProps) {
    if (!message) return null

    return (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
            <ExclamationTriangleIcon className={"w-4 h-4"}/>
            <p>{message}</p>
        </div>
    )
}