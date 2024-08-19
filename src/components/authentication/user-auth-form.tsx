import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/server/auth"


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {


  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form
          action={async (formData) => {
            "use server"
            await signIn("sendgrid", formData)
          }}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                name="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
            />
          </div>
          <Button
              type="submit"
          >
            Continue with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"/>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
        <div className="flex flex-row justify-between items-center mx-10 -my-1">
            <form
                action={async () => {
                    "use server"
                    await signIn("google")
                }}
            >
                <button type="submit" className={""}>
                    <img style={{display: "block"}} src="https://authjs.dev/img/providers/google.svg" height="32"
                         width="32" alt={"Google"}/>
                </button>
            </form>
            <form
                action={async () => {
                    "use server"
                    await signIn("instagram")
                }}
            >
                <button type="submit" className={""}>
                    <img style={{display: "block"}} src="https://authjs.dev/img/providers/instagram.svg"
                         height="32" width="32" alt={"Instagram"}/>
                </button>
            </form>
            <form
                action={async () => {
                    "use server"
                    await signIn("facebook")
                }}
            >
                <button type="submit" className={""}>
                    <img style={{display: "block"}} src="https://authjs.dev/img/providers/facebook.svg"
                         height="32" width="32" alt={"Instagram"}/>
                </button>
            </form>
        </div>
    </div>
  )
}
