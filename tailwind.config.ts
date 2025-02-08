import type { Config } from "tailwindcss"
const {heroui} = require("@heroui/react");

const config = {
	darkMode: ["class"],
	mode: "jit",
	content: [
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			padding: {
				DEFAULT: "1rem",
				cm: "2rem",
				lg: "4rem",
			},
			screens: {
				"2xl": "1400px",
			},
		},
		header: {
			center: "true",
			padding: {
				DEFAULT: "1rem",
				cm: "2rem",
				lg: "4rem",
			},
		},
		extend: {
			colors: {
				text: "hsl(var(--text))",
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				greenBakerz: "hsl(var(--green-bakerz))",
				redBakerz: "hsl(var(--red-bakerz))",
				orangeBakerz: "hsl(var(--orange-bakerz))",
				grayBg: "hsl(var(--gray-bg))",
				grayText: "hsl(var(--gray-text))",
				grayBgComp: "hsl(var(--gray-bg-component))",
				outlineComp: "hsl(var(--outline-component))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					hover: "hsl(var(--secondary-hover))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				outline: {
					DEFAULT: "hsl(var(--outline))",
					foreground: "hsl(var(--outline-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			screens: {
				tm: "400px",
				cm: "540px",
				desktop: "768px",
				"store-sm": "1000px",
				"girl-md": "580px",
				"store-image": "1350px",
				"heart-display": "1370px",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.5s ease-out",
				"accordion-up": "accordion-up 0.5s ease-out",
				"caret-blink": "caret-blink 1.25s ease-out infinite",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
		heroui(),
		require("@tailwindcss/typography"),
	],
} satisfies Config;


export default config