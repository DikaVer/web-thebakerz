/**
 * @fileoverview Allergen icon lookup and renderer component.
 *
 * Exports iconAllergyMap, mapping lowercase allergen names (egg, milk,
 * gluten, nuts, etc.) to the SVG icon components defined in allergy-icon.tsx,
 * and AllergenIcon, which resolves an allergen string case-insensitively and
 * renders the matching icon or null when unknown.
 */
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
    iconHoney
} from "@/components/store/product/components/allergy-icon"

export const iconAllergyMap: Record<string, React.FC<{ size?: number }>> = {
    egg: iconEggs,
    milk: iconMilk,
    gluten: iconGluten,
    walnut: iconWalnut,
    cashew: iconCashew,
    nuts: iconNuts,
    wheat: iconWheat,
    gelatin: iconGelatin,
    peach: iconPeach,
    kiwi: iconKiwi,
    sesame: iconSesame,
    apple: iconApple,
    lupine: iconLupine,
    soy: iconSoy,
    orange: iconOrange,
    banana: iconBanana,
    honey: iconHoney,
    fish: iconFish,
    matsuke: iconMatsuke,
    chicken: iconChicken,
    potato: iconPotato,
    pork: iconPork,
    squid: iconSquid,
    mushroom: iconMushroom,
    crab: iconCrab,
    celery: iconCelery,
    beef: iconBeef,
    shrimp: iconShrimp,
    sulfur: iconSulfurDioxideSulphites,
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
    // const t = useTranslations('Allergies')
    // t('honey')
    return <IconComponent size={size} />
}
