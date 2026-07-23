/**
 * @fileoverview Tailwind CSS configuration for the application.
 *
 * Enables class-based dark mode, extends the theme with HSL CSS-variable-driven
 * color tokens (primary, secondary, card, chart, etc.), custom breakpoints,
 * border radii, and keyframe animations, and registers the tailwindcss-animate,
 * HeroUI, and typography plugins.
 */

import type { Config } from "tailwindcss";
const { heroui } = require("@heroui/react");

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
    			DEFAULT: '1rem',
    			cm: '2rem',
    			lg: '4rem'
    		},
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	header: {
    		center: 'true',
    		padding: {
    			DEFAULT: '1rem',
    			cm: '2rem',
    			lg: '4rem'
    		}
    	},
    	extend: {

    		colors: {
    			text: 'hsl(var(--text))',
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: {
					DEFAULT: 'hsl(var(--background))',
					secondary: 'hsl(var(--background-secondary))'
				},
    			foreground: 'hsl(var(--foreground))',
    			outlineComp: 'hsl(var(--outline-component))',
    			primary: {
    				'100': 'hsl(var(--primary) / 0.1)',
    				'200': 'hsl(var(--primary) / 0.2)',
    				'300': 'hsl(var(--primary) / 0.3)',
    				'400': 'hsl(var(--primary) / 0.4)',
    				'500': 'hsl(var(--primary) / 0.5)',
    				'600': 'hsl(var(--primary) / 0.6)',
    				'700': 'hsl(var(--primary) / 0.7)',
    				'800': 'hsl(var(--primary) / 0.8)',
    				'900': 'hsl(var(--primary) / 0.9)',
    				DEFAULT: 'hsl(var(--primary))',
    				hover: 'hsl(var(--primary-hover))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
				default: {
					DEFAULT: 'hsl(var(--default))',
					foreground: 'hsl(var(--default-foreground))',
					'100': 'hsl(var(--default-100))'
				},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				hover: 'hsl(var(--secondary-hover))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			outline: {
    				DEFAULT: 'hsl(var(--outline))',
    				foreground: 'hsl(var(--outline-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))',
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		screens: {
    			desktop: '768px',
    			'heart-display': '1370px'
    		},
    		keyframes: {
				"scrolling-banner": {
					from: {transform: "translateX(0)"},
					to: {transform: "translateX(calc(-50% - var(--gap)/2))"},
				},
				"scrolling-banner-vertical": {
					from: {transform: "translateY(0)"},
					to: {transform: "translateY(calc(-50% - var(--gap)/2))"},
				},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'caret-blink': {
    				'0%,70%,100%': {
    					opacity: '1'
    				},
    				'20%,50%': {
    					opacity: '0'
    				}
    			}
    		},
    		animation: {
				"scrolling-banner": "scrolling-banner var(--duration) linear infinite",
				"scrolling-banner-vertical": "scrolling-banner-vertical var(--duration) linear infinite",
    			'accordion-down': 'accordion-down 0.5s ease-out',
    			'accordion-up': 'accordion-up 0.5s ease-out',
    			'caret-blink': 'caret-blink 1.25s ease-out infinite'
    		}
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		heroui(),
		require("@tailwindcss/typography"),
	],
} satisfies Config;

export default config;
