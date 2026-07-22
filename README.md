# 🥐 TheBakerz

**A multi-sided marketplace connecting customers with local bakeries.**

TheBakerz lets customers discover nearby bakeries, browse their catalogs, and order fresh baked goods for delivery or pickup — while giving bakery owners a full-featured dashboard to run their business online.

🌐 **Live at [thebakerz.com](https://www.thebakerz.com/)**

---

## ✨ Features

### For Customers
- 🔍 **Discover & Search** — find local bakeries and products with category, dietary, and allergy filters
- 🛒 **Ordering** — cart, checkout, and secure payments powered by Stripe
- 🚚 **Delivery & Pickup** — flexible scheduling with time slots
- 🎂 **Custom Cakes** — request made-to-order creations directly from bakers
- ♻️ **Rescue Deals** — discounted surplus goods that help reduce food waste
- 🌍 **Multi-language** — available in English, Dutch, French, German, Spanish, Russian, and Ukrainian

### For Bakeries
- 📊 **Business Dashboard** — manage products, orders, and store settings in one place
- 🧁 **Product Catalog** — products with variants, pricing adjustments, and inventory holds
- 📦 **Order Management** — real-time order tracking and status updates
- 🗓️ **Availability** — configure delivery zones, pickup windows, and time slots

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS · Shadcn/ui · Hero UI |
| Database | PostgreSQL · Azure Cosmos DB |
| Storage | Azure Blob Storage |
| Payments | Stripe |
| Auth | Email OTP · Google OAuth |
| Maps | Azure Maps · Google Maps |
| Email | Azure Communication Services · React Email |
| Deployment | Vercel · Docker |

## 🏗️ Architecture Highlights

- **Server Components & Server Actions** — server-first rendering with typed mutations
- **Zod validation** — every input validated at the boundary
- **Internationalization** — 7 locales with tooling to sync and verify translation integrity
- **Mobile-first** — designed for ordering on the go
- **SEO** — generated sitemaps, structured metadata, and image optimization

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Running the full app requires environment variables for PostgreSQL, Azure services, Stripe, and Google OAuth.

### Useful Scripts

```bash
pnpm build                 # Production build
pnpm lint                  # Run ESLint
pnpm translations:clean    # Verify & sync translation files
pnpm sitemap:generate      # Generate sitemap.xml
```

## 📄 License

All rights reserved. This repository is public for viewing purposes only.
