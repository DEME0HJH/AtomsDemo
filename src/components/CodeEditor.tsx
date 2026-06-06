'use client';

import { useState, useCallback } from 'react';
import { AppFile } from '@/types';
import { FileCode, FileJson, FileType, Save, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface CodeEditorProps {
  files: AppFile[];
  onChange: (files: AppFile[]) => void;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  'html': 'html',
  'css': 'css',
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'jsx',
  'tsx': 'tsx',
  'json': 'json',
  'md': 'markdown',
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'html') return <FileType size={14} className="text-orange-400" />;
  if (ext === 'css') return <FileCode size={14} className="text-blue-400" />;
  if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') return <FileCode size={14} className="text-yellow-400" />;
  if (ext === 'json') return <FileJson size={14} className="text-green-400" />;
  return <FileCode size={14} className="text-atoms-textMuted" />;
};

const getLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return languageMap[ext] || 'text';
};

export default function CodeEditor({ files, onChange, readOnly = false }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const { showToast } = useToast();

  const handleContentChange = useCallback((content: string) => {
    const updated = [...files];
    updated[activeFile] = { ...updated[activeFile], content };
    onChange(updated);
  }, [files, activeFile, onChange]);

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    if (files.find(f => f.path === name)) {
      showToast('文件已存在', 'error');
      return;
    }
    const newFile: AppFile = {
      path: name,
      content: '',
      language: getLanguage(name),
    };
    onChange([...files, newFile]);
    setActiveFile(files.length);
    setNewFileName('');
    setShowNewFile(false);
    showToast(`文件 ${name} 已创建`, 'success');
  };

  const handleDeleteFile = (index: number) => {
    if (files.length <= 1) {
      showToast('至少需要保留一个文件', 'error');
      return;
    }
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    if (activeFile >= index && activeFile > 0) {
      setActiveFile(activeFile - 1);
    }
    showToast('文件已删除', 'success');
  };

  const handleSave = () => {
    showToast('代码已保存', 'success');
  };

  const currentFile = files[activeFile];

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full text-atoms-textMuted">
        <p>没有可编辑的文件</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-atoms-card border border-atoms-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-atoms-border bg-atoms-dark">
        <div className="flex items-center gap-2">
          <span className="text-xs text-atoms-textMuted">
            {files.length} 个文件
          </span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewFile(!showNewFile)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border transition-colors"
              title="新建文件"
            >
              <Plus size={14} />
              新建
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-atoms-accent hover:bg-atoms-accent/10 transition-colors"
              title="保存"
            >
              <Save size={14} />
              保存
            </button>
          </div>
        )}
      </div>

      {/* New File Input */}
      {showNewFile && !readOnly && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-atoms-border bg-atoms-dark">
          <input
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            placeholder="文件名 (如: styles.css)"
            className="flex-1 px-2 py-1 rounded bg-atoms-card border border-atoms-border text-xs text-atoms-text focus:outline-none focus:ring-1 focus:ring-atoms-accent"
            onKeyDown={e => e.key === 'Enter' && handleAddFile()}
          />
          <button
            onClick={handleAddFile}
            className="px-2 py-1 rounded bg-atoms-accent text-white text-xs hover:bg-atoms-accentHover transition-colors"
          >
            创建
          </button>
          <button
            onClick={() => setShowNewFile(false)}
            className="p-1 rounded text-atoms-textMuted hover:text-atoms-text"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree */}
        <div className="w-48 border-r border-atoms-border overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={file.path}
              onClick={() => setActiveFile(index)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                index === activeFile
                  ? 'bg-atoms-accent/10 text-atoms-accent border-r-2 border-atoms-accent'
                  : 'text-atoms-textMuted hover:text-atoms-text hover:bg-atoms-border/50'
              }`}
            >
              {getFileIcon(file.path)}
              <span className="flex-1 truncate text-xs">{file.path}</span>
              {!readOnly && files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-atoms-error transition-opacity"
                  title="删除文件"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center px-3 py-1.5 border-b border-atoms-border bg-atoms-dark">
            <span className="text-xs text-atoms-textMuted">
              {currentFile.path}
            </span>
            <span className="ml-2 text-xs text-atoms-textMuted/50">
              {currentFile.language}
            </span>
          </div>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              value={currentFile.content}
              onChange={e => handleContentChange(e.target.value)}
              readOnly={readOnly}
              spellCheck={false}
              className="w-full h-full p-4 bg-atoms-dark text-atoms-text text-sm font-mono resize-none focus:outline-none"
              style={{
                lineHeight: '1.6',
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
