import React from 'react'
import {
    iconWalnut,
    iconKiwi,
    iconSesame,
    iconPotato,
    iconGluten,
    iconApple,
    iconLupine,
    iconSoy,
    iconOrange,
    iconBanana,
    iconCashew,
    iconEggs,
    iconFish,
    iconMatsuke,
    iconChicken,
    iconPork,
    iconSquid,
    iconMushroom,
    iconCrab,
    iconCelery,
    iconPeach,
    iconBeef,
    iconMilk,
    iconShrimp,
    iconWheat,
    iconGelatin,
    iconSulfurDioxideSulphites,
    iconNuts,
    iconAbalone,
} from "@/components/store/product/components/allergy-icon"

export const iconAllergyMap: Record<string, React.FC<{ size?: number }>> = {
    walnut: iconWalnut,
    kiwi: iconKiwi,
    sesame: iconSesame,
    potato: iconPotato,
    gluten: iconGluten,
    apple: iconApple,
    lupine: iconLupine,
    soy: iconSoy,
    orange: iconOrange,
    banana: iconBanana,
    cashew: iconCashew,
    egg: iconEggs,
    fish: iconFish,
    matsuke: iconMatsuke,
    chicken: iconChicken,
    pork: iconPork,
    squid: iconSquid,
    mushroom: iconMushroom,
    crab: iconCrab,
    celery: iconCelery,
    peach: iconPeach,
    beef: iconBeef,
    milk: iconMilk,
    shrimp: iconShrimp,
    wheat: iconWheat,
    gelatin: iconGelatin,
    sulfur: iconSulfurDioxideSulphites,
    nuts: iconNuts,
    abalone: iconAbalone,
}

interface AllergenIconProps {
    allergen: string
    size?: number
}

export const AllergenIcon: React.FC<AllergenIconProps> = ({ allergen, size = 24 }) => {
    // Case-insensitive lookup
    const key = allergen.toLowerCase()
    const IconComponent = iconAllergyMap[key]

    // Fallback behavior (here returning null if unknown)
    if (!IconComponent) {
        return null
    }
    return <IconComponent size={size} />
}
