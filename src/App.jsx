import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://twwqvqxpjhvyhthbpexs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d3F2cXhwamh2eWh0aGJwZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTk5NTUsImV4cCI6MjA4ODQ3NTk1NX0.D0PLCcg6vq2k4nmyKHDS7z0HdJWjQc0sriIq5omYAuc";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation"
};

async function sbGet(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  return res.json();
}
async function sbInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST", headers, body: JSON.stringify(body)
  });
  return res.json();
}
async function sbUpdate(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH", headers, body: JSON.stringify(body)
  });
  return res.json();
}
async function sbDelete(table, id) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers });
}
async function sbUpsert(table, body, onConflict) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body)
  });
  return res.json();
}
async function sbDeleteWhere(table, col, val) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`, { method: "DELETE", headers });
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');`;

const STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Lora', serif; background: #f5efe6; color: #3b2f2f; }
.app { min-height: 100vh; background: #f5efe6; background-image: radial-gradient(ellipse at 20% 10%, #e8d5b7 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, #d4b896 0%, transparent 50%); padding: 0 0 60px 0; }
.header { background: #3b2f2f; padding: 28px 32px 24px; text-align: center; position: relative; overflow: hidden; }
.header::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px); }
.header-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-style: italic; color: #e8d5b7; letter-spacing: 0.02em; }
.header-sub { font-family: 'Lora', serif; font-size: 0.8rem; color: #a07850; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; }
.nav { display: flex; justify-content: center; background: #2a2020; border-bottom: 2px solid #a07850; }
.nav-btn { background: none; border: none; color: #a07850; font-family: 'Lora', serif; font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 28px; cursor: pointer; transition: all 0.2s; position: relative; }
.nav-btn.active { color: #e8d5b7; background: rgba(160,120,80,0.15); }
.nav-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #e8d5b7; }
.nav-btn:hover:not(.active) { color: #c9a87a; }
.container { max-width: 780px; margin: 0 auto; padding: 32px 20px; }
.card { background: #fffdf8; border: 1px solid #e0cebc; border-radius: 2px; padding: 28px; margin-bottom: 20px; box-shadow: 3px 3px 0 #e0cebc, 0 1px 12px rgba(59,47,47,0.06); position: relative; }
.card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, #a07850, #c9a87a); border-radius: 2px 0 0 2px; }
.section-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-style: italic; color: #3b2f2f; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px dashed #c9a87a; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6a50; font-family: 'Lora', serif; }
input, select, textarea { background: #fdf8f0; border: 1px solid #d4b896; border-radius: 2px; padding: 10px 12px; font-family: 'Lora', serif; font-size: 0.9rem; color: #3b2f2f; outline: none; transition: border-color 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #a07850; background: #fffdf8; }
textarea { resize: vertical; min-height: 70px; }
.format-select { display: flex; gap: 10px; flex-wrap: wrap; }
.format-btn { flex: 1; background: #fdf8f0; border: 1px solid #d4b896; border-radius: 2px; padding: 10px 8px; font-family: 'Lora', serif; font-size: 0.82rem; color: #8a6a50; cursor: pointer; transition: all 0.2s; text-align: center; min-width: 80px; }
.format-btn.selected { background: #3b2f2f; border-color: #3b2f2f; color: #e8d5b7; }
.format-btn:hover:not(.selected) { border-color: #a07850; color: #a07850; }
.stars { display: flex; gap: 4px; align-items: center; }
.star { font-size: 1.4rem; cursor: pointer; color: #d4b896; transition: color 0.15s; line-height: 1; }
.star.lit { color: #a07850; }
.btn { background: #3b2f2f; color: #e8d5b7; border: none; border-radius: 2px; padding: 12px 28px; font-family: 'Lora', serif; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
.btn:hover { background: #a07850; color: #fffdf8; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.secondary { background: transparent; border: 1px solid #a07850; color: #a07850; }
.btn.secondary:hover { background: #a07850; color: #fffdf8; }
.book-item { background: #fffdf8; border: 1px solid #e0cebc; border-radius: 2px; padding: 20px 24px; margin-bottom: 14px; box-shadow: 2px 2px 0 #e0cebc; display: flex; gap: 20px; align-items: flex-start; }
.book-spine { width: 6px; align-self: stretch; border-radius: 2px; flex-shrink: 0; background: linear-gradient(to bottom, #a07850, #c9a87a); }
.book-info { flex: 1; }
.book-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; color: #3b2f2f; }
.book-author { font-style: italic; color: #8a6a50; font-size: 0.88rem; margin-top: 2px; }
.book-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
.tag { background: #f0e6d6; border: 1px solid #d4b896; border-radius: 20px; padding: 2px 10px; font-size: 0.72rem; color: #8a6a50; letter-spacing: 0.05em; text-transform: uppercase; }
.tag.format { background: #3b2f2f; color: #e8d5b7; border-color: #3b2f2f; }
.tag.status-reading { background: #e8f0e8; border-color: #90b090; color: #4a6a4a; }
.tag.status-done { background: #e8e0f0; border-color: #9080b0; color: #4a3a6a; }
.tag.status-want { background: #f0ece0; border-color: #c0b080; color: #6a5a2a; }
.book-stars { display: flex; gap: 2px; }
.book-star { color: #d4b896; font-size: 0.9rem; }
.book-star.lit { color: #a07850; }
.book-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.icon-btn { background: none; border: 1px solid #d4b896; border-radius: 2px; padding: 5px 9px; color: #8a6a50; cursor: pointer; font-size: 0.8rem; font-family: 'Lora', serif; transition: all 0.15s; }
.icon-btn:hover { background: #3b2f2f; color: #e8d5b7; border-color: #3b2f2f; }
.log-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 20px; }
.log-day { aspect-ratio: 1; border-radius: 2px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border: 1px solid #d4b896; background: #fdf8f0; transition: all 0.15s; font-size: 0.7rem; color: #8a6a50; font-family: 'Lora', serif; gap: 2px; }
.log-day:hover { border-color: #a07850; }
.log-day.read { background: #3b2f2f; border-color: #3b2f2f; color: #e8d5b7; }
.log-day.today { border-color: #a07850; border-width: 2px; }
.log-day-num { font-weight: 600; font-size: 0.85rem; }
.log-book-label { font-size: 0.55rem; letter-spacing: 0.03em; opacity: 0.75; text-align: center; line-height: 1.2; }
.month-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.month-label { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-style: italic; color: #3b2f2f; }
.day-labels { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
.day-label { text-align: center; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #a07850; font-family: 'Lora', serif; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-box { background: #3b2f2f; border-radius: 2px; padding: 20px; text-align: center; color: #e8d5b7; }
.stat-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; }
.stat-label { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #a07850; margin-top: 4px; }
.empty { text-align: center; padding: 40px; color: #a07850; font-style: italic; font-size: 0.95rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(59,47,47,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.modal { background: #fffdf8; border: 1px solid #d4b896; border-radius: 2px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 6px 6px 0 #d4b896; max-height: 90vh; overflow-y: auto; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-style: italic; color: #3b2f2f; margin-bottom: 20px; }
.log-book-list { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.log-book-option { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid #d4b896; border-radius: 2px; cursor: pointer; background: #fdf8f0; font-family: 'Lora', serif; font-size: 0.88rem; color: #3b2f2f; transition: all 0.15s; }
.log-book-option:hover { border-color: #a07850; }
.log-book-option.selected { background: #3b2f2f; color: #e8d5b7; border-color: #3b2f2f; }
.progress-bar-wrap { background: #e0cebc; border-radius: 2px; height: 6px; margin-top: 6px; overflow: hidden; }
.progress-bar { height: 100%; background: #a07850; border-radius: 2px; transition: width 0.3s; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #3b2f2f; color: #e8d5b7; padding: 10px 24px; border-radius: 2px; font-family: 'Lora', serif; font-size: 0.85rem; z-index: 200; opacity: 0; transition: opacity 0.3s; pointer-events: none; white-space: nowrap; }
.toast.show { opacity: 1; }
.loading { text-align: center; padding: 60px; color: #a07850; font-style: italic; font-family: 'Lora', serif; }
.sync-dot { position: absolute; top: 14px; right: 16px; font-size: 0.7rem; color: #a07850; font-family: 'Lora', serif; letter-spacing: 0.05em; }
@media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .book-item { flex-wrap: wrap; } .nav-btn { padding: 14px 16px; font-size: 0.75rem; } }
`;

const FORMATS = ["📖 Physical", "📱 Digital", "🎧 Audiobook"];
const STATUSES = ["Want to Read", "Reading", "Finished"];
const GENRES = ["Fiction","Non-Fiction","Literary Fiction","Romance","Mystery","Sci-Fi","Fantasy","Biography","History","Poetry","Other"];
const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const emptyForm = { title:'', author:'', genre:'', format:'', status:'Want to Read', start_date:'', end_date:'', total_pages:'', rating:0, notes:'' };

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star ${n<=(hover||value)?'lit':''}`}
          onClick={()=>onChange(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}>★</span>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('shelf');
  const [books, setBooks] = useState([]);
  const [logMap, setLogMap] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [logModal, setLogModal] = useState(null);
  const [logBook, setLogBook] = useState('');
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''), 2500); }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksData, logData] = await Promise.all([
        sbGet('books', 'order=created_at.asc'),
        sbGet('reading_log', 'order=log_date.asc')
      ]);
      setBooks(Array.isArray(booksData) ? booksData : []);
      const lm = {};
      if (Array.isArray(logData)) logData.forEach(l => { lm[l.log_date] = l; });
      setLogMap(lm);
    } catch { showToast('Could not reach cloud. Check your connection.'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveBook() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title, author: form.author || null, genre: form.genre || null,
        format: form.format || null, status: form.status,
        start_date: form.start_date || null, end_date: form.end_date || null,
        total_pages: form.total_pages ? parseInt(form.total_pages) : null,
        rating: form.rating || 0, notes: form.notes || null
      };
      if (editId) { await sbUpdate('books', editId, payload); showToast('Book updated ✓'); }
      else { await sbInsert('books', payload); showToast('Book added ✓'); }
      await loadData();
      setForm(emptyForm); setEditId(null); setShowForm(false);
    } catch { showToast('Error saving. Try again.'); }
    setSaving(false);
  }

  async function deleteBook(id) {
    setSaving(true);
    await sbDelete('books', id);
    showToast('Book removed');
    await loadData();
    setSaving(false);
  }

  function editBook(b) {
    setForm({ ...b, total_pages: b.total_pages||'', start_date: b.start_date||'', end_date: b.end_date||'' });
    setEditId(b.id); setShowForm(true); setTab('shelf');
  }

  function openLog(dateStr) {
    setLogBook(logMap[dateStr]?.book_id || '');
    setLogModal(dateStr);
  }

  async function saveLog() {
    if (!logModal) return;
    setSaving(true);
    try {
      if (logBook) {
        await sbUpsert('reading_log', { log_date: logModal, book_id: logBook }, 'log_date');
        showToast('Reading logged ✓');
      } else {
        await sbDeleteWhere('reading_log', 'log_date', logModal);
        showToast('Log cleared');
      }
      await loadData();
    } catch { showToast('Error saving log.'); }
    setSaving(false);
    setLogModal(null);
  }

  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const readCount = Object.keys(logMap).length;
  const finishedCount = books.filter(b=>b.status==='Finished').length;
  const currentlyReading = books.filter(b=>b.status==='Reading');

  function statusTag(s) {
    if (s==='Reading') return 'status-reading';
    if (s==='Finished') return 'status-done';
    return 'status-want';
  }

  if (loading) return (
    <>
      <style>{FONTS}{STYLES}</style>
      <div className="app">
        <div className="header"><div className="header-title">My Reading Life</div></div>
        <div className="loading">Loading your books from the cloud…</div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONTS}{STYLES}</style>
      <div className="app">
        <div className="header">
          <div className="header-title">My Reading Life</div>
          <div className="header-sub">A Personal Book Tracker</div>
          {saving && <div className="sync-dot">Syncing…</div>}
        </div>
        <nav className="nav">
          {[['shelf','My Shelf'],['log','Reading Log'],['stats','Stats']].map(([key,label])=>(
            <button key={key} className={`nav-btn ${tab===key?'active':''}`} onClick={()=>setTab(key)}>{label}</button>
          ))}
        </nav>

        <div className="container">

          {tab==='shelf' && <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 className="section-title" style={{marginBottom:0,borderBottom:'none',paddingBottom:0}}>My Books</h2>
              <button className="btn" onClick={()=>{setForm(emptyForm);setEditId(null);setShowForm(true);}}>+ Add Book</button>
            </div>
            {showForm && (
              <div className="card" style={{marginBottom:24}}>
                <div className="section-title">{editId?'Edit Book':'Add a New Book'}</div>
                <div className="form-grid">
                  <div className="form-group"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Book title" /></div>
                  <div className="form-group"><label>Author</label><input value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} placeholder="Author name" /></div>
                  <div className="form-group"><label>Genre</label>
                    <select value={form.genre} onChange={e=>setForm(f=>({...f,genre:e.target.value}))}>
                      <option value="">Select genre</option>
                      {GENRES.map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Status</label>
                    <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group full"><label>Format</label>
                    <div className="format-select">
                      {FORMATS.map(fmt=>(
                        <button key={fmt} className={`format-btn ${form.format===fmt?'selected':''}`} onClick={()=>setForm(f=>({...f,format:fmt}))}>{fmt}</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group"><label>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} /></div>
                  <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} /></div>
                  <div className="form-group"><label>Total Pages</label><input type="number" value={form.total_pages} onChange={e=>setForm(f=>({...f,total_pages:e.target.value}))} placeholder="e.g. 320" /></div>
                  <div className="form-group"><label>Rating</label><StarRating value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))} /></div>
                  <div className="form-group full"><label>Notes / Review</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Your thoughts…" /></div>
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <button className="btn" onClick={saveBook} disabled={saving}>{saving?'Saving…':editId?'Save Changes':'Add Book'}</button>
                  <button className="btn secondary" onClick={()=>{setShowForm(false);setEditId(null);setForm(emptyForm);}}>Cancel</button>
                </div>
              </div>
            )}
            {books.length===0 && !showForm && <div className="empty">Your shelf is empty — add your first book above.</div>}
            {books.map(b=>(
              <div key={b.id} className="book-item">
                <div className="book-spine" />
                <div className="book-info">
                  <div className="book-title">{b.title}</div>
                  {b.author && <div className="book-author">by {b.author}</div>}
                  <div className="book-meta">
                    {b.format && <span className="tag format">{b.format}</span>}
                    {b.genre && <span className="tag">{b.genre}</span>}
                    {b.status && <span className={`tag ${statusTag(b.status)}`}>{b.status}</span>}
                    {b.rating>0 && <span className="book-stars">{[1,2,3,4,5].map(n=><span key={n} className={`book-star ${n<=b.rating?'lit':''}`}>★</span>)}</span>}
                  </div>
                  {(b.start_date||b.end_date) && (
                    <div style={{fontSize:'0.75rem',color:'#a07850',marginTop:6,fontStyle:'italic'}}>
                      {b.start_date&&`Started ${b.start_date}`}{b.start_date&&b.end_date&&' · '}{b.end_date&&`Finished ${b.end_date}`}
                    </div>
                  )}
                  {b.notes && <div style={{fontSize:'0.82rem',color:'#6a5040',marginTop:8,fontStyle:'italic',lineHeight:1.5}}>"{b.notes}"</div>}
                </div>
                <div className="book-actions">
                  <button className="icon-btn" onClick={()=>editBook(b)}>Edit</button>
                  <button className="icon-btn" style={{color:'#8b3a3a'}} onClick={()=>deleteBook(b.id)}>Remove</button>
                </div>
              </div>
            ))}
          </>}

          {tab==='log' && (
            <div className="card">
              <div className="month-nav">
                <button className="icon-btn" onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}}>‹</button>
                <div className="month-label">{monthNames[calMonth]} {calYear}</div>
                <button className="icon-btn" onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}}>›</button>
              </div>
              <div className="day-labels">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="day-label">{d}</div>)}
              </div>
              <div className="log-grid">
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} />)}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const day=i+1;
                  const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const entry=logMap[dateStr];
                  const isToday=dateStr===todayStr;
                  const bookTitle=entry?.book_id ? books.find(b=>b.id===entry.book_id)?.title : null;
                  return (
                    <div key={day} className={`log-day ${entry?'read':''} ${isToday?'today':''}`} onClick={()=>openLog(dateStr)}>
                      <span className="log-day-num">{day}</span>
                      {bookTitle && <span className="log-book-label">{bookTitle.length>10?bookTitle.slice(0,9)+'…':bookTitle}</span>}
                      {entry && !bookTitle && <span className="log-book-label">✓</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:16,fontSize:'0.8rem',color:'#a07850',fontStyle:'italic',textAlign:'center'}}>
                Tap any day to log your reading. Dark = read that day.
              </div>
            </div>
          )}

          {tab==='stats' && <>
            <div className="stats-grid">
              <div className="stat-box"><div className="stat-num">{books.length}</div><div className="stat-label">Books Added</div></div>
              <div className="stat-box"><div className="stat-num">{finishedCount}</div><div className="stat-label">Finished</div></div>
              <div className="stat-box"><div className="stat-num">{readCount}</div><div className="stat-label">Days Read</div></div>
            </div>
            {currentlyReading.length>0 && (
              <div className="card">
                <div className="section-title">Currently Reading</div>
                {currentlyReading.map(b=>(
                  <div key={b.id} style={{marginBottom:14}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',fontWeight:600}}>{b.title}</div>
                    {b.author && <div style={{fontSize:'0.82rem',color:'#8a6a50',fontStyle:'italic'}}>by {b.author}</div>}
                    {b.format && <div style={{marginTop:6}}><span className="tag format">{b.format}</span></div>}
                  </div>
                ))}
              </div>
            )}
            <div className="card">
              <div className="section-title">By Format</div>
              {FORMATS.map(fmt=>{
                const count=books.filter(b=>b.format===fmt).length;
                const pct=books.length?Math.round((count/books.length)*100):0;
                return (
                  <div key={fmt} style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:4}}>
                      <span>{fmt}</span><span style={{color:'#a07850'}}>{count} book{count!==1?'s':''}</span>
                    </div>
                    <div className="progress-bar-wrap"><div className="progress-bar" style={{width:`${pct}%`}} /></div>
                  </div>
                );
              })}
              {books.length===0 && <div className="empty" style={{padding:'16px 0'}}>No books yet.</div>}
            </div>
          </>}

        </div>
      </div>

      {logModal && (
        <div className="modal-overlay" onClick={()=>setLogModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Did you read on {logModal}?</div>
            <div className="log-book-list">
              <div className={`log-book-option ${logBook===''?'selected':''}`} onClick={()=>setLogBook('')} style={{color:'#8a6a50',fontStyle:'italic'}}>
                <span>✗</span> No reading today
              </div>
              {books.map(b=>(
                <div key={b.id} className={`log-book-option ${logBook===b.id?'selected':''}`} onClick={()=>setLogBook(b.id)}>
                  <span>📖</span>
                  <div>
                    <div style={{fontWeight:500}}>{b.title}</div>
                    {b.author && <div style={{fontSize:'0.75rem',opacity:0.7}}>by {b.author}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn" onClick={saveLog} disabled={saving}>{saving?'Saving…':'Save'}</button>
              <button className="btn secondary" onClick={()=>setLogModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast?'show':''}`}>{toast}</div>
    </>
  );
}
