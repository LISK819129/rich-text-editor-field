import React, { useRef, useCallback, useEffect, useState } from "react";

export default function RichTextEditorWidget(props = {}) {
  const {
    field = {},
    actions = { updateValue: () => {} },
    readonly = false,
    disabled = false,
    errors = null,
    theme = {},
    color = "#f8f8f8",
    parameters = {},
    value = ""
  } = props;

  const { updateValue } = actions;
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [pasteMode, setPasteMode] = useState('formatted'); // 'formatted' or 'plain'

  // 🎨 CUSTOMIZABLE COLORS - Change these to match your design
  const colors = {
    // Main field colors
    fieldBackground: color || "#f8f8f8",
    fieldBorder: "#ff6600", // Changed from orange to a custom orange
    fieldBorderWidth: "2px", // Changed from 3px
    
    // Editor colors
    editorBackground: "#ffffff",
    editorBorder: "#e0e0e0",
    editorBorderFocused: "#007bff",
    editorText: "#333333",
    
    // Toolbar colors
    toolbarBackground: "#f8f9fa",
    toolbarBorder: "#dee2e6",
    
    // Button colors
    buttonBackground: "#ffffff",
    buttonBorder: "#ced4da",
    buttonHover: "#e9ecef",
    buttonActive: "#007bff",
    buttonText: "#495057",
    
    // Error colors
    errorText: "#dc3545",
    
    // Disabled colors
    disabledBackground: "#f5f5f5",
    disabledText: "#6c757d",
  };

  // Toolbar button configuration with better tooltips (lists removed)
  const toolbarButtons = [
    { command: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { command: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { command: 'underline', icon: 'U', title: 'Underline (Ctrl+U)', shortcut: 'Ctrl+U' },
    { command: 'separator' },
    { command: 'formatBlock', value: 'h1', icon: 'H1', title: 'Heading 1 - Large title' },
    { command: 'formatBlock', value: 'h2', icon: 'H2', title: 'Heading 2 - Medium title' },
    { command: 'formatBlock', value: 'p', icon: 'P', title: 'Paragraph - Normal text' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: '⫷', title: 'Align Left - Left align text' },
    { command: 'justifyCenter', icon: '⫸', title: 'Align Center - Center align text' },
    { command: 'justifyRight', icon: '⫸', title: 'Align Right - Right align text' },
    { command: 'separator' },
    { command: 'removeFormat', icon: '✕', title: 'Clear Formatting - Remove all formatting' },
    { command: 'separator' },
    { command: 'togglePasteMode', icon: pasteMode === 'formatted' ? '📋+' : '📋', title: pasteMode === 'formatted' ? 'Paste Mode: Keep Formatting (Click to change)' : 'Paste Mode: Plain Text (Click to change)' },
  ];

  // Execute editor command
  const executeCommand = useCallback((command, value = null) => {
    if (!editorRef.current) return;

    if (command === 'togglePasteMode') {
      setPasteMode(prev => prev === 'formatted' ? 'plain' : 'formatted');
      return;
    }

    // Ensure editor is focused first
    editorRef.current.focus();

    if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, value);
    } else {
      document.execCommand(command, false, value);
    }

    // Update the value after command execution
    setTimeout(() => {
      if (editorRef.current) {
        updateValue(editorRef.current.innerHTML);
      }
    }, 10);
  }, [updateValue, setPasteMode]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      updateValue(editorRef.current.innerHTML);
    }
  }, [updateValue]);

  // Handle paste events - preserve formatting like Google Docs
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    
    if (pasteMode === 'plain') {
      // Plain text mode - strip all formatting
      const textData = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, textData);
    } else {
      // Formatted mode - preserve formatting like Google Docs
      const htmlData = e.clipboardData.getData('text/html');
      const textData = e.clipboardData.getData('text/plain');
      
      if (htmlData) {
        // Clean up the HTML but preserve basic formatting
        const cleanHtml = cleanPastedHtml(htmlData);
        document.execCommand('insertHTML', false, cleanHtml);
      } else if (textData) {
        // Fallback to plain text
        document.execCommand('insertText', false, textData);
      }
    }
    
    handleInput();
  }, [handleInput, pasteMode]);

  // Clean HTML from external sources while preserving formatting (lists removed from allowed tags)
  const cleanPastedHtml = (html) => {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove dangerous elements and attributes (ul, ol, li removed from allowed tags)
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'img'];
    const allowedAttributes = ['src', 'alt', 'width', 'height', 'style'];
    
    // Remove script tags and other dangerous elements
    const scripts = temp.querySelectorAll('script, style, meta, link');
    scripts.forEach(el => el.remove());
    
    // Remove list elements specifically
    const listElements = temp.querySelectorAll('ul, ol, li');
    listElements.forEach(el => {
      // Replace list items with paragraphs, lists with divs
      if (el.tagName.toLowerCase() === 'li') {
        const p = document.createElement('p');
        p.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(p, el);
      } else {
        // Replace ul/ol with div
        const div = document.createElement('div');
        div.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(div, el);
      }
    });
    
    // Clean up attributes but keep basic styling
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      // Remove non-allowed tags by replacing with their content
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.outerHTML = el.innerHTML;
        return;
      }
      
      // Clean attributes
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Clean up style attribute to only allow safe styles
      if (el.hasAttribute('style')) {
        const style = el.getAttribute('style');
        const cleanStyle = cleanStyleAttribute(style);
        if (cleanStyle) {
          el.setAttribute('style', cleanStyle);
        } else {
          el.removeAttribute('style');
        }
      }
      
      // Handle images - ensure they're responsive and safe
      if (el.tagName.toLowerCase() === 'img') {
        // Add responsive styling to images
        const currentStyle = el.getAttribute('style') || '';
        const newStyle = currentStyle + '; max-width: 100%; height: auto; display: block; margin: 10px 0;';
        el.setAttribute('style', newStyle);
        
        // Ensure alt text exists for accessibility
        if (!el.hasAttribute('alt')) {
          el.setAttribute('alt', 'Pasted image');
        }
      }
    });
    
    return temp.innerHTML;
  };

  // Clean style attributes to only allow safe CSS properties
  const cleanStyleAttribute = (style) => {
    const allowedProperties = [
      'color', 'background-color', 'font-weight', 'font-style', 'text-decoration',
      'font-size', 'font-family', 'text-align', 'margin', 'padding',
      'width', 'height', 'max-width', 'max-height', 'display', 'border', 'border-radius'
    ];
    
    const declarations = style.split(';');
    const cleanDeclarations = declarations.filter(decl => {
      const [property] = decl.split(':').map(s => s.trim());
      return allowedProperties.includes(property);
    });
    
    return cleanDeclarations.join('; ');
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = value || '';
      
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [value]);

  // Toolbar component with improved styling and hover effects
  const Toolbar = () => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      padding: '12px',
      borderBottom: `1px solid ${colors.toolbarBorder}`,
      backgroundColor: colors.toolbarBackground,
      borderRadius: '8px 8px 0 0',
      gap: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {toolbarButtons.map((button, index) => {
        if (button.command === 'separator') {
          return (
            <div
              key={index}
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: colors.toolbarBorder,
                margin: '0 6px',
              }}
            />
          );
        }

        return (
          <button
            key={index}
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevent editor blur
            onClick={() => executeCommand(button.command, button.value)}
            disabled={disabled || readonly}
            title={button.title} // This creates the hover tooltip!
            style={{
              padding: '6px 10px',
              border: `1px solid ${colors.buttonBorder}`,
              backgroundColor: colors.buttonBackground,
              borderRadius: '6px',
              cursor: disabled || readonly ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: button.command === 'bold' ? 'bold' : 'normal',
              fontStyle: button.command === 'italic' ? 'italic' : 'normal',
              textDecoration: button.command === 'underline' ? 'underline' : 'none',
              opacity: disabled || readonly ? 0.5 : 1,
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: colors.buttonText,
            }}
            // Add hover effects with onMouseEnter/Leave since CSS :hover doesn't work in inline styles
            onMouseEnter={(e) => {
              if (!disabled && !readonly) {
                e.target.style.backgroundColor = colors.buttonHover;
                e.target.style.borderColor = colors.buttonActive;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !readonly) {
                e.target.style.backgroundColor = colors.buttonBackground;
                e.target.style.borderColor = colors.buttonBorder;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {button.icon}
          </button>
        );
      })}
    </div>
  );

  if (readonly) {
    return (
      <div style={{
        outline: "3px solid orange",
        backgroundColor: color || "#f8f8f8",
        padding: "10px",
        borderRadius: "5px",
        width: "100%",
      }}>
        <h3>
          {field?.name || "Rich Text Editor"}
          {field?.isRequired && <span style={{ color: "red" }}>*</span>}
        </h3>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "5px",
            minHeight: "100px",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
          dangerouslySetInnerHTML={{ 
            __html: value || "No content entered" 
          }}
        />
        {errors && <p style={{ color: "red", marginTop: "5px" }}>{errors}</p>}
      </div>
    );
  }

  return (
    <div style={{
      outline: "3px solid orange",
      backgroundColor: color || "#f8f8f8",
      padding: "10px",
      borderRadius: "5px",
      width: "100%",
    }}>
      <h3>
        {field?.name || "Rich Text Editor"}
        {field?.isRequired && <span style={{ color: "red" }}>*</span>}
      </h3>
      
      <div style={{
        border: isFocused ? '2px solid #007bff' : '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}>
        <Toolbar />
        
        <div
          ref={editorRef}
          contentEditable={!disabled && !readonly}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            minHeight: '200px',
            maxHeight: '400px',
            padding: '15px',
            fontSize: '14px',
            lineHeight: '1.5',
            outline: 'none',
            backgroundColor: disabled ? '#f5f5f5' : '#fff',
            color: disabled ? '#666' : '#000',
            cursor: disabled ? 'not-allowed' : 'text',
            overflowY: 'auto',
            overflowX: 'hidden',
            wordWrap: 'break-word',
          }}
          data-placeholder={field?.placeholder || 'Enter your text here...'}
        />
      </div>
      
      {errors && <p style={{ color: "red", marginTop: "5px" }}>{errors}</p>}
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          font-style: italic;
        }
        
        [contenteditable] h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        [contenteditable] h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 8px 0;
        }
        
        [contenteditable] p {
          margin: 5px 0;
        }
        
        [contenteditable] a {
          color: #007bff;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #0056b3;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}