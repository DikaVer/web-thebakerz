/**
 * @fileoverview PDF generation from HTML content using headless Chromium.
 *
 * Exports generatePdf, which launches a Playwright Chromium instance, loads the
 * given HTML, waits for network idle, and returns an A4 PDF buffer with
 * backgrounds printed. Used to produce invoice PDFs from rendered invoice
 * markup.
 */
const { chromium } = require('playwright');

export const generatePdf = async (htmlContent:any) => {
    let browser;
    try {
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Set the page content and wait until the network is idle
        await page.setContent(htmlContent, { waitUntil: 'networkidle' });

        // Generate the PDF and save it to 'output.pdf'
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    } finally {
        // if (browser) {
        //     browser.close();
        // }
    }
};
