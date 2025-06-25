# Rich Text Editor Custom Field for KissFlow

## Overview

This is a custom rich text editor component designed for KissFlow workflows. The editor provides essential text formatting capabilities while maintaining a clean and user-friendly interface. It relies on browser-based `contentEditable` and `document.execCommand` features to deliver rich text editing functionality.

## Features

### Text Formatting
- **Bold** - Make text bold (Ctrl+B)
- **Italic** - Make text italic (Ctrl+I) 
- **Underline** - Underline text (Ctrl+U)

### Document Structure
- **Heading 1** - Large title formatting
- **Heading 2** - Medium title formatting
- **Paragraph** - Normal text formatting

### Text Alignment
- **Left Align** - Align text to the left
- **Center Align** - Center align text
- **Right Align** - Align text to the right

### Additional Features
- **Clear Formatting** - Remove all formatting from selected text
- **Paste Mode Toggle** - Switch between formatted paste (preserves styling) and plain text paste
- **Image Support** - Paste and display images with automatic responsive sizing
- **Link Support** - Create and display clickable links

## Technical Requirements

- **Browser Compatibility**: Modern browsers with `contentEditable` support
- **Dependencies**: React 16.8+ (uses hooks)
- **Node Version**: v16

## Setup and Installation

### Prerequisites
```bash
# Ensure you're using Node v16
node --version  # Should show v16.x.x
```

### Installation
```bash
# Install dependencies using npm
npm install

# OR install using pnpm (recommended)
pnpm install
```

### Development
Make your required changes to the component files, then build the project:

```bash
# Build the custom field component
form-field-scripts build
```

The built files will appear in the `/dist` directory.

### Deployment to KissFlow

1. **Compress Files**: Create a ZIP archive of all files in the `/dist` directory
2. **Upload**: Go to your KissFlow workspace
3. **Navigate**: Go to Custom Field Component section
4. **Import**: Upload the compressed ZIP file
5. **Preview**: Test the component in preview mode
6. **Publish**: Once satisfied, publish the component for use in workflows

## Usage

The component accepts standard KissFlow custom field props and integrates seamlessly with form workflows. It supports all standard field configurations including:

- Required field validation
- Custom field names and labels  
- Readonly and disabled states
- Custom styling and themes
- Error message display

## Browser Compatibility Note

This component relies on browser-native rich text editing features (`contentEditable` and `document.execCommand`). While these APIs are widely supported, some advanced formatting features may vary slightly between different browsers and versions.


This is a Kissflow's custom form field project, scaffolded using `@kissflow/create-kf-component`.

## Screenshots  

### Main Interface
![Main Interface](https://i.postimg.cc/fb1wJhYQ/Screenshot-2025-06-20-at-1-52-36-PM.png)


