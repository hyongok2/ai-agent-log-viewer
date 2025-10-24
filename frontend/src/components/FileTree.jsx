import { useState } from 'react';
import './FileTree.css';

function TreeNode({ node, onFileSelect, selectedFile, level = 0 }) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isDirectory = node.type === 'directory';
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  const indent = level * 16;

  return (
    <div className="tree-node">
      <div
        className={`tree-node-label ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleClick}
      >
        <span className="tree-node-icon">
          {isDirectory ? (isOpen ? '📂' : '📁') : '📄'}
        </span>
        <span className="tree-node-name">{node.name}</span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="tree-node-children">
          {node.children.map((child, index) => (
            <TreeNode
              key={`${child.path}-${index}`}
              node={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileTree({ tree, onFileSelect, selectedFile }) {
  if (!tree) {
    return <div className="tree-empty">No files found</div>;
  }

  return (
    <div className="file-tree">
      <TreeNode
        node={tree}
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
      />
    </div>
  );
}

export default FileTree;
