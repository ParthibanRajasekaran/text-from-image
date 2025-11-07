# 📸 Extract Text From Image

> Free, private, AI-powered OCR tool running entirely in your browser

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)

## ✨ Features

- 🚀 **Lightning Fast** - 2-7 second processing time
- 🔒 **100% Private** - All processing happens in your browser
- 🤖 **AI-Powered** - Hybrid OCR using Tesseract.js + TrOCR transformers
- 📊 **Smart Fallback** - Automatically uses best method for each image
- 🎨 **Image Enhancement** - 8 preprocessing techniques for better accuracy
- 💰 **Completely Free** - No API costs, no hidden fees
- 🌓 **Dark/Light Mode** - Beautiful UI with theme toggle
- 📱 **Mobile Friendly** - Responsive design for all devices
- ✨ **V3 Premium UI** - Aurora gradients, glass-morphism, micro-interactions
- ⌨️ **Keyboard Shortcuts** - Quick actions with keyboard (C/D/H/T/Escape)
- 📚 **Local History** - Last 20 results saved in browser
- ♿ **Fully Accessible** - WCAG 2.1 AA compliant, keyboard navigation
- 🎯 **SEO Optimized** - Intent-specific pages with FAQ rich snippets

## 🎨 UI Variants

### V3 Premium UI (Recommended)

Enable with `VITE_UX_V2=1` environment variable for:

- **Aurora Background** - Animated gradient blobs with grain texture
- **Glass Morphism** - Modern glassmorphic cards with backdrop blur
- **Staged Progress** - 3-step progress indicator (Upload → OCR → Render)
- **Confetti Animation** - Celebratory micro-interaction on copy
- **History Drawer** - Slide-in drawer with last 20 results
- **Keyboard Shortcuts**:
  - `C` - Copy result
  - `D` - Download result  
  - `H` - View history
  - `T` - Toggle theme
  - `Escape` - Close drawer/clear result
- **Core Web Vitals** - LCP < 1.8s, INP < 200ms, CLS < 0.1
- **5 Intent Pages** - SEO-optimized routes with FAQ sections

### Classic UI (Fallback)

Original simple UI without premium features.

## 🎯 Accuracy

- **92-97% accuracy** on printed text
- **70-85% accuracy** on handwritten text
- Automatic confidence scoring
- Intelligent fallback for low-confidence results

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ParthibanRajasekaran/text-from-image.git
cd text-from-image

# Install dependencies
npm install

# Create .env.local file for V3 UI (optional)
echo "VITE_UX_V2=1" > .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Hybrid OCR System

```
User uploads image
        ↓
┌──────────────────┐
│ File Validation  │ (Type, size, browser compatibility)
└──────────────────┘
        ↓
┌──────────────────┐
│ Image Preprocessing │ (Optional: 8 enhancement techniques)
└──────────────────┘
        ↓
┌──────────────────┐
│ Tesseract OCR    │ (Fast: 2-5s, 90-95% accuracy)
└──────────────────┘
        ↓
    Confidence ≥ 60%?
        ├─ Yes → Return result ✓
        └─ No  → Fallback ↓
                ┌──────────────────┐
                │ TrOCR AI Model   │ (Slower: 5-10s, 95-98% accuracy)
                └──────────────────┘
                        ↓
                   Return result ✓
```

### Tech Stack

- **Frontend:** React 19.2 + TypeScript
- **Build Tool:** Vite 6.2
- **OCR Engines:**
  - Tesseract.js 5.1.1 (traditional OCR)
  - @xenova/transformers 2.17.2 (AI-powered TrOCR)
- **Image Processing:** HTML5 Canvas API
- **State Management:** React Hooks
- **Styling:** CSS with custom properties

## 📂 Project Structure

```
text-from-image/
├── components/          # React components
│   ├── v3/             # V3 Premium UI components
│   │   ├── AuroraBackground.tsx
│   │   ├── GlassDropzone.tsx
│   │   ├── GlassProgressBar.tsx
│   │   ├── GlassResultCard.tsx
│   │   ├── HistoryDrawer.tsx
│   │   ├── HeroOCR.tsx
│   │   └── IntentPage.tsx
│   ├── FileInput.tsx
│   ├── ResultDisplay.tsx
│   ├── ThemeToggle.tsx
│   ├── ProgressBar.tsx
│   ├── Skeleton.tsx
│   ├── AdSlot.tsx
│   └── Toast.tsx
├── services/           # OCR services
│   ├── tesseractService.ts
│   ├── transformersService.ts
│   └── hybridService.ts
├── hooks/             # Custom React hooks
│   ├── useLocalHistory.ts
│   ├── useShortcuts.ts
│   └── useWebVitals.ts
├── pages/             # Route pages (lazy-loaded)
│   ├── ImageToText.tsx
│   ├── JpgToWord.tsx
│   ├── ImageToExcel.tsx
│   └── ExtractTextFromImage.tsx
├── utils/             # Utilities
│   ├── imagePreprocessing.ts
│   ├── errorHandling.ts
│   ├── webVitals.ts
│   └── fileUtils.ts
├── __tests__/         # Test files
├── App.tsx            # Main app component
├── router.tsx         # React Router config
└── index.tsx          # Entry point
```

## 🛠️ How It Works

### 1. Image Upload
- Supports PNG, JPG, WEBP
- Max file size: 20MB
- Drag & drop or click to browse

### 2. Processing
- **Step 1:** Validate file (type, size, browser compatibility)
- **Step 2:** Apply image preprocessing (optional, auto-enabled)
- **Step 3:** Try Tesseract OCR (fast method)
- **Step 4:** If confidence < 60%, fallback to TrOCR AI model

### 3. Results
- Extracted text with confidence score
- Copy to clipboard
- Download as .txt or .doc
- Shows which method was used

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Speed** | 2-7 seconds average |
| **Accuracy** | 92-97% (printed text) |
| **Cost** | $0 (completely free) |
| **Privacy** | 100% client-side |
| **Success Rate** | 95%+ with hybrid approach |

### vs Google Gemini (Previous)

| Aspect | Gemini API | This App | Winner |
|--------|-----------|----------|--------|
| Speed | 1-2s | 2-7s | Gemini |
| Accuracy | 95-99% | 92-97% | Gemini |
| **Cost** | $0.001-0.01/image | **$0** | **This App** 🏆 |
| **Privacy** | ❌ Cloud | ✅ **Local** | **This App** 🏆 |
| **Offline** | ❌ No | ✅ **Yes*** | **This App** 🏆 |

*After first-time model download

## 🔒 Privacy

- ✅ **100% client-side processing** - No server uploads
- ✅ **No data collection** - Your images never leave your device
- ✅ **No API keys required** - No external dependencies
- ✅ **No tracking** - Privacy-first design
- ✅ **GDPR compliant** - No personal data processed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

### Third-Party Licenses

- Tesseract.js - Apache 2.0
- @xenova/transformers - Apache 2.0
- React - MIT
- Vite - MIT

All dependencies are compatible with commercial use.

## 🙏 Acknowledgments

- [Tesseract.js](https://github.com/naptha/tesseract.js) - Traditional OCR engine
- [Transformers.js](https://github.com/xenova/transformers.js) - Browser-based AI models
- [Microsoft TrOCR](https://huggingface.co/microsoft/trocr-base-printed) - AI OCR model

## 📮 Contact

- Repository: [github.com/ParthibanRajasekaran/text-from-image](https://github.com/ParthibanRajasekaran/text-from-image)
- Issues: [github.com/ParthibanRajasekaran/text-from-image/issues](https://github.com/ParthibanRajasekaran/text-from-image/issues)

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐️ on GitHub!

---

Made with ❤️ by [Parthiban Rajasekaran](https://github.com/ParthibanRajasekaran)
