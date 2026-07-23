/**
 * @fileoverview Configuration for the next-css-obfuscator package used by the obfuscate-build script.
 *
 * Enables CSS class name obfuscation in "random" mode for .jsx, .tsx, .js, .ts,
 * .html, and .rsc build output, refreshes the class conversion JSON on each run,
 * and blacklists Next.js cache, API route, and framework chunk paths from
 * processing.
 */

module.exports = {
    enable: true,
    mode: "random", // random | simplify | simplify-seedable
    refreshClassConversionJson: true, // recommended set to true if not in production
    allowExtensions: [".jsx", ".tsx", ".js", ".ts", ".html", ".rsc"],

    // enableMarkers: true,

    blackListedFolderPaths: [
        "./.next/cache",
        /\.next\/server\/pages\/api/,
        /_document..*js/,
        /_app-.*/,
        /__.*/, // <= maybe helpful if you are using Next.js Local Fonts [1*]
    ],
};