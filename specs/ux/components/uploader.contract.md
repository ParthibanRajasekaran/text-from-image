# Uploader Component Contract

## Props
- `onFileSelect: (File) => void` — called when a file is selected
- `accept: string` — accepted file types
- `label: string` — visible label and accessible name
- `preview: boolean` — show image preview

## Accessibility
- The uploader must have an accessible name equal to the visible label
- The preview must be focusable and have alt text
- There must be exactly one <main> landmark on the page
- If a modal is present, background must use `inert`
