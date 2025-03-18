import puppeteer from "puppeteer";
import path from "path";

export const generatePdf = async (htmlContent: any, orderId: string, isDownload: boolean) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const styledHtmlContent = `
        <style>
            body {
                background-color: #525659; /* Replace with your desired background color */
                margin: 0; /* Ensure no margin */
                padding: 0; /* Ensure no padding */
                width: 100%;
                height: 100%;
            }
        </style>
        ${htmlContent}
    `;

    await page.setContent(styledHtmlContent, { waitUntil: "networkidle0" });

// Saves the PDF in the public folder for later use.: if its not for download
    if (!isDownload) {
        const outputPath = path.join(process.cwd(), `public/documents/document-${orderId}.pdf`);
        await page.pdf({ path: outputPath, format: "A4", printBackground: true });
        await browser.close();
        return;
    }

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return pdfBuffer;
};