import { IntentPage } from '../components/v3/IntentPage';
import { isUXV3Enabled } from '../utils/env';
import App from '../App';

/**
 * Image to Excel page
 * SEO-optimized route for /image-to-excel
 */
export default function ImageToExcel() {
  if (!isUXV3Enabled()) {
    return <App />;
  }

  return (
    <IntentPage
      title="Image to Excel - Extract Text from Images for Spreadsheets"
      description="Extract text from images to use in Excel. Convert screenshots, scanned tables, and documents to editable text for your spreadsheets. Free OCR tool."
      heading="Extract Text for Excel"
      subheading="Convert images to text that's ready to paste into Excel, Google Sheets, or any spreadsheet application."
      keywords={['image to excel', 'screenshot to excel', 'table ocr', 'extract table', 'image to spreadsheet', 'ocr excel']}
      canonicalUrl="https://freetextfromimage.com/image-to-excel"
      faq={[
        {
          question: 'Can this extract tables directly to Excel format?',
          answer: 'This tool extracts text content which you can then copy and paste into Excel. For structured table data, you may need to format the columns after pasting.',
        },
        {
          question: 'Does it preserve cell structure?',
          answer: 'The OCR extracts text content as plain text. While it captures the text accurately, you will need to organize it into cells manually in Excel after extraction.',
        },
        {
          question: 'What types of images work best for Excel data?',
          answer: 'Images with clear, tabular data work best. Screenshots of spreadsheets, printed tables, and scanned documents with column-based layouts provide the best results.',
        },
      ]}
    />
  );
}
