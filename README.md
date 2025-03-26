This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Installation

### Setting up pnpm in Visual Studio Code

Unlike WebStorm which has pnpm pre-installed, you'll need to install pnpm manually in VS Code:

1. Install Node.js from [nodejs.org](https://nodejs.org/) if you haven't already
2. Install pnpm globally by running:

```bash
npm install -g pnpm
```

3. Verify the installation:

```bash
pnpm --version
```

### Fixing PowerShell Execution Policy Issues

If you get a PowerShell security error like:
```
pnpm : File C:\Program Files\nodejs\pnpm.ps1 cannot be loaded. The file C:\Program Files\nodejs\pnpm.ps1 is not digitally signed.
You cannot run this script on the current system.
```

You have two options:

#### Option 1: Run PowerShell as Administrator and change the execution policy
```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### Option 2: Use the Corepack version of pnpm
```bash
# Enable corepack (comes with Node.js)
corepack enable

# Use corepack to install pnpm
corepack prepare pnpm@latest --activate
```

### Installing Project Dependencies

Once pnpm is installed, install the project dependencies:

```bash
pnpm install
```

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
