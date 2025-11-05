
// This declares the global jsPDF object from the script tag in index.html
declare const jspdf: any;

export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadDoc = (text: string, filename: string) => {
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
    </head>
    <body>
      <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPdf = (text: string, filename: string) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  
  const lines = doc.splitTextToSize(text, 180); // 180 is the width of the text block
  doc.text(lines, 10, 10);
  doc.save(filename);
};
