/**
 * @fileoverview Dietary restriction icon lookup and renderer component.
 *
 * Exports iconSuperMap, mapping dietary keys (sugar-free, lactose-free,
 * gluten-free, halal, vegan) to the SVG icon components from super-icon.tsx,
 * and DietaryIcon, which resolves a dietary string case-insensitively and
 * renders the matching icon or null when unknown.
 */
import React from 'react'
import {
    noSugar,
    noLactose,
    noGluten,
    iconHalal,
    iconVegan
} from "@/components/store/product/components/super-icon"

export const iconSuperMap: Record<string, React.FC<{ size?: number }>> = {
    'sugar-free': noSugar,
    'lactose-free': noLactose,
    'gluten-free': noGluten,
    'halal': iconHalal,
    'vegan': iconVegan,
}

interface DietaryIconProps {
    dietary: string
    size?: number
}

export const DietaryIcon: React.FC<DietaryIconProps> = ({ dietary, size = 24 }) => {
    // Case-insensitive lookup
    const key = dietary.toLowerCase()
    const IconComponent = iconSuperMap[key]

    // Fallback behavior (here returning null if unknown)
    if (!IconComponent) {
        return null
    }
    
    return <IconComponent size={size} />
}
