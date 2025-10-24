import { useState, useEffect } from 'react';
import FileTree from './components/FileTree';
import LogViewer from './components/LogViewer';
import './App.css';

const API_URL = 'http://localhost:5701';

function App() {
  const [tree, setTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  // Load directory tree
  const loadTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/tree`);
      const data = await response.json();

      if (data.success) {
        setTree(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(`Failed to load tree: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load file content
  const loadFile = async (filePath) => {
    setLoading(true);
    setError(null);
    setSelectedFile(filePath);

    try {
      const response = await fetch(
        `${API_URL}/api/file?path=${encodeURIComponent(filePath)}`
      );
      const data = await response.json();

      if (data.success) {
        setFileContent(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reload tree
  const handleReload = async () => {
    await loadTree();
    setSelectedFile(null);
    setFileContent(null);
  };

  // Handle sidebar resize
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.body.classList.add('resizing');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.body.classList.remove('resizing');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Initial load
  useEffect(() => {
    loadTree();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Agent Log Viewer</h1>
        <button onClick={handleReload} disabled={loading} className="reload-btn">
          🔄 Reload
        </button>
      </header>

      <div className="app-content">
        <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
          <h2>Files</h2>
          {loading && !tree && <div className="loading">Loading...</div>}
          {error && <div className="error">{error}</div>}
          {tree && (
            <FileTree
              tree={tree}
              onFileSelect={loadFile}
              selectedFile={selectedFile}
            />
          )}
        </div>

        <div
          className={`resize-handle ${isResizing ? 'resizing' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="main-content">
          {!fileContent && !loading && (
            <div className="empty-state">
              Select a file from the tree to view its content
            </div>
          )}
          {loading && selectedFile && (
            <div className="loading">Loading file...</div>
          )}
          {fileContent && (
            <LogViewer file={fileContent} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
