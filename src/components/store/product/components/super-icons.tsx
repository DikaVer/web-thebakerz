import React from 'react'
import {
    noSugar,
    noLactose,
    noGluten,
    iconHalal
} from "@/components/store/product/components/super-icon"

export const iconSuperMap: Record<string, React.FC<{ size?: number }>> = {
    'sugar-free': noSugar,
    'lactose-free': noLactose,
    'gluten-free': noGluten,
    'halal': iconHalal,
    'vegan': iconHalal, // Temporarily using halal icon as placeholder for vegan
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
