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