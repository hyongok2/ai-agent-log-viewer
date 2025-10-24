import { useMemo, useState, useEffect, useRef } from 'react';
import './LogViewer.css';

// Highlight search term in text
function highlightText(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ?
      <mark key={i} className="search-highlight">{part}</mark> :
      part
  );
}

// Check if JSON contains error indicators
function hasError(obj) {
  if (!obj || typeof obj !== 'object') return false;

  // Check for common error patterns
  if (obj.error) return true;
  if (obj.status === 'error' || obj.status === 'failed') return true;
  if (obj.isError === true) return true;
  if (obj.success === false) return true;

  // Recursively check nested objects
  for (const key in obj) {
    if (typeof obj[key] === 'object' && hasError(obj[key])) {
      return true;
    }
  }

  return false;
}

// Recursively process JSON to handle \n in string values
function processJsonValue(value, indent = 0, searchTerm = '') {
  const indentStr = '  '.repeat(indent);
  const nextIndent = '  '.repeat(indent + 1);

  if (value === null) {
    return <span className="json-null">null</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="json-boolean">{value.toString()}</span>;
  }

  if (typeof value === 'number') {
    const text = value.toString();
    return <span className="json-number">{highlightText(text, searchTerm)}</span>;
  }

  if (typeof value === 'string') {
    // Check if string contains newlines
    if (value.includes('\n')) {
      const lines = value.split('\n');
      return (
        <span className="json-string-multiline">
          "{lines.map((line, i) => (
            <span key={i}>
              {searchTerm ? highlightText(line, searchTerm) : line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}"
        </span>
      );
    }
    return <span className="json-string">"{highlightText(value, searchTerm)}"</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>[]</span>;
    }
    return (
      <span>
        {'[\n'}
        {value.map((item, i) => (
          <span key={i}>
            {nextIndent}
            {processJsonValue(item, indent + 1, searchTerm)}
            {i < value.length - 1 ? ',\n' : '\n'}
          </span>
        ))}
        {indentStr}]
      </span>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return <span>{'{}'}</span>;
    }
    return (
      <span>
        {'{\n'}
        {keys.map((key, i) => (
          <span key={key}>
            {nextIndent}
            <span className="json-key">"{highlightText(key, searchTerm)}"</span>
            {': '}
            {processJsonValue(value[key], indent + 1, searchTerm)}
            {i < keys.length - 1 ? ',\n' : '\n'}
          </span>
        ))}
        {indentStr}{'}'}
      </span>
    );
  }

  return String(value);
}

function LogViewer({ file }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  // Parse content into blocks
  const contentBlocks = useMemo(() => {
    if (!file?.content) return [];

    const lines = file.content.split('\n');
    const blocks = [];
    let currentBlock = [];
    let inJsonBlock = false;
    let jsonBuffer = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect JSON block start
      if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && !inJsonBlock) {
        // Save previous block if any
        if (currentBlock.length > 0) {
          blocks.push({ type: 'text', lines: currentBlock });
          currentBlock = [];
        }

        inJsonBlock = true;
        jsonBuffer = line;
      } else if (inJsonBlock) {
        jsonBuffer += '\n' + line;

        // Try to parse accumulated JSON
        try {
          JSON.parse(jsonBuffer);
          // Valid JSON complete
          blocks.push({ type: 'json', content: jsonBuffer });
          jsonBuffer = '';
          inJsonBlock = false;
        } catch (e) {
          // Continue accumulating
        }
      } else {
        currentBlock.push(line);
      }
    }

    // Handle remaining content
    if (jsonBuffer) {
      blocks.push({ type: 'json', content: jsonBuffer });
    }
    if (currentBlock.length > 0) {
      blocks.push({ type: 'text', lines: currentBlock });
    }

    return blocks;
  }, [file?.content]);

  // Handle Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  if (!file) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    // Create a blob from the file content
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <div className="log-info">
          <h3 className="log-filename">{file.name}</h3>
          <div className="log-meta">
            <span>Size: {formatSize(file.size)}</span>
            <span>•</span>
            <span>Modified: {formatDate(file.modified)}</span>
          </div>
        </div>
        <div className="log-actions">
          <button
            className="search-btn"
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }
            }}
            title="Search (Ctrl+F)"
          >
            🔍 Search
          </button>
          <button className="download-btn" onClick={handleDownload} title="Download file">
            💾 Download
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search in log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="search-close"
            onClick={() => {
              setShowSearch(false);
              setSearchTerm('');
            }}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      )}

      <div className="log-content">
        {contentBlocks.map((block, index) => {
          if (block.type === 'json') {
            try {
              const parsed = JSON.parse(block.content);
              const isError = hasError(parsed);
              return (
                <pre
                  key={index}
                  className={`json-block ${isError ? 'json-error' : ''}`}
                >
                  {processJsonValue(parsed, 0, searchTerm)}
                </pre>
              );
            } catch (e) {
              return (
                <pre key={index} className="text-block">
                  {searchTerm ? highlightText(block.content, searchTerm) : block.content}
                </pre>
              );
            }
          } else {
            return (
              <div key={index} className="text-block">
                {block.lines.map((line, lineIndex) => (
                  <div key={lineIndex} className="text-line">
                    {searchTerm ? highlightText(line, searchTerm) : line}
                  </div>
                ))}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default LogViewer;
