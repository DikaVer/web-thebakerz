/**
 * @fileoverview Shared Google font configurations loaded via next/font.
 *
 * Exports lexendDeca (Lexend Deca in all weights, used as the general UI
 * font) and pacifico (Pacifico regular, used for the TheBakerz brand
 * wordmark), both with the Latin subset.
 */
import { Lexend_Deca, Pacifico } from 'next/font/google';

// Configure Lexend Deca font
export const lexendDeca = Lexend_Deca({ weight: [
        '100', '200',
        '300', '400',
        '500', '600',
        '700', "800",
    '900'], subsets: ['latin'] });

// Configure Pacifico font
export const pacifico = Pacifico({ weight: [
        '400'
    ], subsets: ['latin'] });