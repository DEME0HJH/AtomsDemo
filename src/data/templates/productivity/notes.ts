import { AppTemplate, TemplateParams } from '../types';

const defaultCode = {
  html: `
<div class="notes-app">
  <header class="notes-header">
    <h1 class="notes-title">📝 记事本</h1>
  </header>
  <div class="notes-toolbar">
    <button id="newNoteBtn" class="notes-new-btn">+ 新建笔记</button>
    <input id="searchInput" class="notes-search" placeholder="搜索笔记..." />
  </div>
  <div id="notesList" class="notes-list"></div>
  <div id="editorPanel" class="editor-panel" style="display:none;">
    <div class="editor-header">
      <input id="noteTitleInput" class="editor-title-input" placeholder="笔记标题" />
      <div>
        <button id="saveNoteBtn" class="editor-btn editor-save-btn">保存</button>
        <button id="cancelBtn" class="editor-btn editor-cancel-btn">取消</button>
      </div>
    </div>
    <textarea id="noteContentInput" class="editor-content" placeholder="写点什么..."></textarea>
  </div>
</div>`,
  css: `
* { margin: 0; padding: 0; box-sizing: border-box; }
.notes-app { max-width: 600px; margin: 0 auto; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; background: #fffbeb; }
.notes-header { margin-bottom: 20px; text-align: center; }
.notes-title { font-size: 28px; font-weight: 700; color: #1f2937; }
.notes-toolbar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.notes-new-btn { padding: 10px 20px; background: #1f2937; color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.notes-new-btn:hover { background: #374151; }
.notes-search { flex: 1; min-width: 200px; padding: 10px 16px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; outline: none; transition: border-color 0.2s; background: white; }
.notes-search:focus { border-color: #f59e0b; }
.notes-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.note-card { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.2s; border-left: 4px solid #f59e0b; }
.note-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.note-card-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
.note-card-preview { font-size: 13px; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.note-card-time { font-size: 11px; color: #9ca3af; margin-top: 8px; }
.note-card-delete { float: right; padding: 4px 8px; background: #fee2e2; color: #ef4444; border: none; border-radius: 6px; font-size: 11px; cursor: pointer; }
.editor-panel { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.editor-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.editor-title-input { flex: 1; padding: 10px 14px; font-size: 18px; font-weight: 600; border: 2px solid #e5e7eb; border-radius: 10px; outline: none; min-width: 150px; }
.editor-title-input:focus { border-color: #f59e0b; }
.editor-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.editor-save-btn { background: #f59e0b; color: white; }
.editor-save-btn:hover { background: #d97706; }
.editor-cancel-btn { background: #f3f4f6; color: #374151; }
.editor-cancel-btn:hover { background: #e5e7eb; }
.editor-content { width: 100%; min-height: 250px; padding: 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: inherit; resize: vertical; outline: none; line-height: 1.6; }
.editor-content:focus { border-color: #f59e0b; }
.empty-state { text-align: center; color: #9ca3af; padding: 40px 20px; }
@media (max-width: 500px) { .notes-list { grid-template-columns: 1fr; } }
`,
  js: `
document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const editorPanel = document.getElementById('editorPanel');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteContentInput = document.getElementById('noteContentInput');
  const searchInput = document.getElementById('searchInput');
  let notes = JSON.parse(localStorage.getItem('atoms_notes') || '[]');
  let editingId = null;

  function save() { localStorage.setItem('atoms_notes', JSON.stringify(notes)); }
  function render(query = '') {
    const filtered = query ? notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())) : notes;
    if (filtered.length === 0) {
      notesList.innerHTML = '<div class="empty-state">📭 ' + (query ? '没有匹配的笔记' : '还没有笔记，点击上方按钮创建') + '</div>';
      return;
    }
    notesList.innerHTML = filtered.map(n => {
      const preview = n.content.substring(0, 50) + (n.content.length > 50 ? '...' : '');
      return '<div class="note-card" data-id="' + n.id + '">' +
        '<button class="note-card-delete" data-action="delete" data-id="' + n.id + '">删除</button>' +
        '<div class="note-card-title">' + escapeHtml(n.title || '无标题') + '</div>' +
        '<div class="note-card-preview">' + escapeHtml(preview) + '</div>' +
        '<div class="note-card-time">' + formatTime(n.updatedAt) + '</div>' +
      '</div>';
    }).join('');
  }
  function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
  function formatTime(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  function openEditor(id = null) {
    editingId = id;
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) { noteTitleInput.value = note.title; noteContentInput.value = note.content; }
    } else {
      noteTitleInput.value = ''; noteContentInput.value = '';
    }
    editorPanel.style.display = 'block'; notesList.style.display = 'none';
    noteTitleInput.focus();
  }
  function closeEditor() {
    editorPanel.style.display = 'none'; notesList.style.display = 'grid';
    editingId = null;
  }
  function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (!title && !content) return;
    if (editingId) {
      const note = notes.find(n => n.id === editingId);
      if (note) { note.title = title; note.content = content; note.updatedAt = Date.now(); }
    } else {
      notes.unshift({ id: Date.now().toString(), title: title || '无标题', content, createdAt: Date.now(), updatedAt: Date.now() });
    }
    save(); render(); closeEditor();
  }

  document.getElementById('newNoteBtn').addEventListener('click', () => openEditor(null));
  document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
  document.getElementById('cancelBtn').addEventListener('click', closeEditor);
  searchInput.addEventListener('input', () => render(searchInput.value));

  notesList.addEventListener('click', e => {
    const card = e.target.closest('.note-card');
    if (!card) return;
    if (e.target.dataset.action === 'delete') {
      notes = notes.filter(n => n.id !== e.target.dataset.id);
      save(); render();
    } else {
      openEditor(card.dataset.id);
    }
  });

  render();
});
`,
};

export const notesTemplate: AppTemplate = {
  id: 'notes',
  name: '记事本',
  category: 'productivity',
  description: '富文本记事本，新建/编辑/删除笔记，支持搜索',
  icon: 'FileText',
  params: { title: '记事本' },
  code: defaultCode,
};
