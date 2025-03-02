import React from 'react'
import {
    Egg,
    Wheat,
    Nut,
    Milk,
    Leaf,
    LucideIcon,
} from 'lucide-react'



const iconMap: Record<string, LucideIcon> = {
    egg: Egg,
    gluten: Wheat,
    milk: Milk,
    nuts: Nut,
    soy: Leaf,
}

interface AllergenIconProps {
    allergen: string
    size?: number
}

export const AllergenIcon: React.FC<AllergenIconProps> = ({ allergen, size = 20 }) => {
    // Attempt a case-insensitive lookup
    const key = allergen.toLowerCase()

    // If unknown, fallback to an AlertTriangle icon
    const IconComponent = iconMap[key]

    if (!IconComponent) {
        return null
    } else {
        return <IconComponent size={size}/>
    }
}