# TheBakerz Project Guide

## Project Overview
TheBakerz is a multi-sided marketplace platform connecting customers with local bakeries. Built with Next.js 15, TypeScript, and PostgreSQL, it provides a comprehensive e-commerce solution for bakery businesses.

## Technology Stack
- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS, Shadcn/ui, Hero UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (primary), Azure Cosmos DB (documents)
- **Storage**: Azure Blob Storage
- **Payments**: Stripe
- **Auth**: Email OTP, Google OAuth
- **Deployment**: Docker, Azure

## Key Development Commands
```bash
# Development
pnpm dev              # Start development server (port 3000)
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint

# CSS Obfuscation
pnpm obfuscate-build # Obfuscate CSS classes for production

# Translations
pnpm translations:find-unused  # Find unused translation keys
pnpm translations:sync         # Sync translation files
pnpm translations:check        # Check translation integrity
pnpm translations:clean        # Run all translation maintenance tasks

# Utilities
pnpm sitemap:generate         # Generate sitemap.xml
pnpm test:metadata-refresh    # Test metadata refresh functionality
```

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── (store)/           # Store-specific pages
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── providers/        # Context providers
│   └── [feature]/        # Feature-specific components
├── lib/                   # Core business logic
│   ├── actions/          # Server actions
│   ├── api/              # API client functions
│   └── utils/            # Utility functions
└── styles/               # Global styles
```

## Key Features
1. **Marketplace**: Browse stores, search products, place orders
2. **Store Management**: Business dashboard, product management, order tracking
3. **Ordering**: Cart, checkout, payment processing (Stripe)
4. **Delivery/Pickup**: Scheduling system with time slots
5. **Search & Filters**: Category, dietary, allergy filters
6. **Multi-language**: EN, NL, FR, DE, ES, RU, UK
7. **Rescue Deals**: Special deals to reduce food waste

## Important Patterns
- **Server Components**: Default to server components, use 'use client' when needed
- **Server Actions**: Use for data mutations (marked with 'use server')
- **Data Validation**: Always validate with Zod schemas
- **Error Handling**: Use try-catch blocks, return consistent error formats
- **State Management**: Context providers for global state, URL state for filters

## Database Schema Key Tables
- **User**: Authentication and profile
- **Business**: Store information
- **Product**: Product catalog with variants
- **Order**: Order management
- **Cart**: Shopping cart items
- **DeliveryAddress**: Customer delivery locations

## API Conventions
- REST API endpoints in `/app/api/`
- Server actions in `/lib/actions/`
- Always validate input with Zod
- Return consistent response formats
- Use bearer token authentication for API routes

## Testing & Quality
- Run `pnpm lint` before committing
- No dedicated test command found - ask user for testing approach
- Use TypeScript strict mode
- Follow existing code patterns

## Environment Variables
Key environment variables needed:
- Database connections (PostgreSQL, Cosmos DB)
- Azure services (Blob Storage, Communication, Maps)
- Stripe API keys
- Google OAuth credentials
- Email service configuration

## Common Tasks

### Adding a New Feature
1. Create component in appropriate directory
2. Add server action if data mutation needed
3. Create/update API route if external access required
4. Add translations to all language files
5. Update types/schemas as needed

### Working with Products
- Products stored in PostgreSQL
- Support for variants (size, color, etc.)
- Price calculation includes variant adjustments
- Inventory management with holds system

### Order Processing
1. Cart management (cookie-based)
2. Checkout with delivery/pickup selection
3. Stripe payment processing
4. Order creation and notification
5. Status tracking and updates

## Development Tips
- Use the existing UI components from `/components/ui/`
- Follow the established file naming conventions
- Leverage existing providers for state management
- Always handle loading and error states
- Remember to add translations for new text
- Test on mobile - the app is mobile-first

## Security Considerations
- Session-based authentication
- Input validation on all user inputs
- CSRF protection enabled
- Rate limiting on sensitive endpoints
- Never expose sensitive keys in client code

## Performance Optimization
- Image optimization with Next.js Image
- Lazy loading for components
- Turbopack for faster development
- CSS obfuscation for production
- Proper caching strategies

## Deployment
- Docker multi-stage build
- Standalone Next.js output
- Environment-specific configurations
- Azure cloud infrastructure