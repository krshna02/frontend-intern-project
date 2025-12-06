// Sample data 
var sampleJSON = [
  { id: 1, text: "We should improve onboarding to reduce churn.", author: "Priya", createdAt: "2025-11-20T09:10:00Z" },
  { id: 2, text: "Consider A/B testing the new flow to validate assumptions.", author: "Arjun", createdAt: "2025-11-21T11:00:00Z" }
];

// App state
var state = {
  notes: [],
  nextId: 1000
};

// DOM refs
var notesGrid = document.getElementById('notesGrid');
var noteForm = document.getElementById('noteForm');
var noteInput = document.getElementById('noteInput');
var clearBtn = document.getElementById('clearBtn');
var loadSampleBtn = document.getElementById('loadSample');
var resetBtn = document.getElementById('resetBtn');
var statNotes = document.getElementById('statNotes');
var statAuthors = document.getElementById('statAuthors');
var countPill = document.getElementById('countPill');
var filterSearch = document.getElementById('filterSearch');
var sortSelect = document.getElementById('sortSelect');

// Helpers
function trimText(s) {
  return String(s || "").trim();
}
function toKey(s) {
  return trimText(s).toLowerCase();
}
function wordCount(s) {
  return trimText(s).split(/\s+/).filter(Boolean).length;
}
function canAddMore() {
  return state.notes.length < 3;
}
function isDuplicate(text, ignoreId) {
  var key = toKey(text);
  for (var i = 0; i < state.notes.length; i++) {
    var n = state.notes[i];
    if (ignoreId && n.id === ignoreId) { continue; }
    if (toKey(n.text) === key) { return true; }
  }
  return false;
}

// UI updates
function updateStats() {
  statNotes.textContent = state.notes.length;
  var authors = {};
  for (var i = 0; i < state.notes.length; i++) {
    var a = state.notes[i].author || "Unknown";
    authors[a] = true;
  }
  var authorCount = Object.keys(authors).length;
  statAuthors.textContent = authorCount;
  countPill.textContent = state.notes.length + (state.notes.length === 1 ? " note" : " notes");
}

function clearNotesGrid() {
  while (notesGrid.firstChild) { notesGrid.removeChild(notesGrid.firstChild); }
}

function renderNotes() {
  clearNotesGrid();
  var q = trimText(filterSearch.value).toLowerCase();
  // simple sorting: newest/oldest
  var items = state.notes.slice();
  if (sortSelect && sortSelect.value === 'newest') {
    items.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
  } else {
    items.sort(function(a,b){ return new Date(a.createdAt) - new Date(b.createdAt); });
  }

  for (var i = 0; i < items.length; i++) {
    var n = items[i];
    if (q && n.text.toLowerCase().indexOf(q) === -1) { continue; }

    var card = document.createElement('div');
    card.className = 'note-card';

    var meta = document.createElement('div');
    meta.className = 'note-meta';
    meta.innerHTML = '<span>' + (n.author || 'Unknown') + '</span><span>' + (new Date(n.createdAt)).toLocaleString() + '</span>';

    var text = document.createElement('div');
    text.className = 'note-text';
    text.textContent = n.text;

    var actions = document.createElement('div');
    actions.className = 'note-actions';

    var editBtn = document.createElement('button');
    editBtn.className = 'ghost';
    editBtn.textContent = 'Edit';
    (function(noteId){
      editBtn.onclick = function(){ editNote(noteId); };
    })(n.id);

    var delBtn = document.createElement('button');
    delBtn.className = 'ghost';
    delBtn.textContent = 'Delete';
    (function(noteId){
      delBtn.onclick = function(){ deleteNote(noteId); };
    })(n.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(meta);
    card.appendChild(text);
    card.appendChild(actions);

    notesGrid.appendChild(card);
  }

  if (!notesGrid.hasChildNodes()) {
    var empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No notes yet. Add one using the form.';
    notesGrid.appendChild(empty);
  }
}

// Core actions
function addNote(text, author) {
  text = trimText(text);
  if (!text) {
    alert('Note cannot be empty.');
    return false;
  }
  if (!canAddMore()) {
    alert('Maximum of 3 notes allowed.');
    return false;
  }
  if (isDuplicate(text)) {
    alert('Duplicate note. Enter a new one.');
    return false;
  }
  var note = {
    id: state.nextId++,
    text: text,
    author: author || 'You',
    createdAt: (new Date()).toISOString()
  };
  state.notes.push(note);
  renderNotes();
  updateStats();
  return true;
}

function editNote(id) {
  var idx = -1;
  for (var i = 0; i < state.notes.length; i++) {
    if (state.notes[i].id === id) { idx = i; break; }
  }
  if (idx === -1) { return; }
  var current = state.notes[idx];
  var updated = prompt('Edit your note:', current.text);
  if (updated === null) { return; } // cancelled
  updated = trimText(updated);
  if (!updated) { alert('Note cannot be empty.'); return; }
  if (isDuplicate(updated, id)) { alert('Duplicate note. Enter a new one.'); return; }
  state.notes[idx].text = updated;
  state.notes[idx].createdAt = (new Date()).toISOString();
  renderNotes();
  updateStats();
}

function deleteNote(id) {
  if (!confirm('Delete this note?')) { return; }
  var newNotes = [];
  for (var i = 0; i < state.notes.length; i++) {
    if (state.notes[i].id !== id) { newNotes.push(state.notes[i]); }
  }
  state.notes = newNotes;
  renderNotes();
  updateStats();
}

function loadSample() {
  // simple copy
  state.notes = [];
  for (var i = 0; i < sampleJSON.length; i++) {
    var s = sampleJSON[i];
    state.notes.push({ id: state.nextId++, text: s.text, author: s.author, createdAt: s.createdAt });
  }
  renderNotes();
  updateStats();
}

function resetThread() {
  if (!confirm('Clear all notes?')) { return; }
  state.notes = [];
  state.nextId = 1000;
  renderNotes();
  updateStats();
}

// Events
if (noteForm) {
  noteForm.onsubmit = function(e) {
    if (e && e.preventDefault) { e.preventDefault(); }
    var text = noteInput.value;
    var ok = addNote(text, 'You');
    if (ok) { noteInput.value = ''; noteInput.focus(); }
  };
}

if (clearBtn) {
  clearBtn.onclick = function() { noteInput.value = ''; noteInput.focus(); };
}
if (loadSampleBtn) {
  loadSampleBtn.onclick = function() { if (confirm('Load sample notes? This will replace your current notes.')) { loadSample(); } };
}
if (resetBtn) {
  resetBtn.onclick = function() { resetThread(); };
}
if (filterSearch) {
  filterSearch.oninput = function() { renderNotes(); };
}
if (sortSelect) {
  sortSelect.onchange = function() { renderNotes(); };
}

// Init
(function init(){
  state.nextId = 1000;
  loadSample();
})();
