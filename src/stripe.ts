import 'server-only'

import Stripe from 'stripe'

// Fall back to a placeholder so the Stripe client can be constructed at module
// load during `next build` when the secret key is absent (e.g. closed-site
// build with no secrets). With the real key present, behaviour is unchanged.
export const stripe = new Stripe(process.env.NEXT_PRIVATE_STRIPE_SECRET_KEY || 'sk_test_placeholder')
