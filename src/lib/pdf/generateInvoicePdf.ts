import puppeteer from "puppeteer";

export const generatePdf = async (htmlContent: any) => {
    let browser;
    try {
        // Launch Puppeteer with additional flags for environments like Docker or serverless platforms
        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Create styled HTML content with embedded CSS for a consistent layout
        const styledHtmlContent = `
        <style>
            body {
                background-color: #525659; /* Background color */
                margin: 0; /* Remove default margin */
                padding: 0; /* Remove default padding */
                width: 100%;
                height: 100%;
            }
        </style>
        ${htmlContent}
    `;

        // Set the content of the page and wait for the network to be idle.
        await page.setContent(styledHtmlContent, { waitUntil: "networkidle0" });

        // Generate the PDF with specified options
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
