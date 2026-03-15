import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://twwqvqxpjhvyhthbpexs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d3F2cXhwamh2eWh0aGJwZXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTk5NTUsImV4cCI6MjA4ODQ3NTk1NX0.D0PLCcg6vq2k4nmyKHDS7z0HdJWjQc0sriIq5omYAuc";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation"
};

async function sbGet(table, query="") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  return res.json();
}
async function sbInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers, body:JSON.stringify(body) });
  return res.json();
}
async function sbUpdate(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"PATCH", headers, body:JSON.stringify(body) });
  return res.json();
}
async function sbDelete(table, id) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"DELETE", headers });
}
async function sbUpsert(table, body, onConflict) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method:"POST",
    headers:{...headers,"Prefer":"resolution=merge-duplicates,return=representation"},
    body:JSON.stringify(body)
  });
  return res.json();
}
async function sbDeleteWhere(table, col, val) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`, { method:"DELETE", headers });
}

const GOOGLE_BOOKS_KEY = "AIzaSyBXSbmfceyS5byvHaxP4HES9_7EbOjEark";

async function searchGoogleBooks(query) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12&printType=books&key=${GOOGLE_BOOKS_KEY}`);
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map(item => {
      const info = item.volumeInfo || {};
      const cover = info.imageLinks
        ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || null)
        : null;
      const cover_url = cover
        ? cover.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
        : null;
      const rawDesc = info.description || '';
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        title: info.title || '',
        author: info.authors ? info.authors[0] : '',
        year: info.publishedDate ? info.publishedDate.slice(0,4) : '',
        pages: info.pageCount || '',
        cover_url,
        genre: info.categories ? info.categories[0] : '',
        synopsis: cleanDesc,
        gb_id: item.id || '',
      };
    });
  } catch { return []; }
}

async function fetchBookDetails(gbId) {
  if (!gbId) return '';
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${gbId}?key=${GOOGLE_BOOKS_KEY}`);
    const data = await res.json();
    const desc = data.volumeInfo?.description || '';
    const clean = desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return clean;
  } catch { return ''; }
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,wght@0,600;0,700;1,600;1,700&display=swap');`;

const STYLES = `
:root {
  --sage: #AE445A;
  --sage-light: #C4768A;
  --sage-pale: #F5EEF0;
  --sage-dark: #451952;
  --bg: #F2E8EC;
  --white: #FFFFFF;
  --ink: #1D1A39;
  --ink-soft: #451952;
  --mid: #662549;
  --accent: #F39F5A;
  --accent-light: #FDEFD8;
  --border: #E8D0D8;
  --card-shadow: 0 2px 16px rgba(29,26,57,0.10);
  --goal-green: #F39F5A;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
body { font-family: 'Nunito', sans-serif; background: var(--bg); color: var(--ink); }
.app { min-height: 100vh; background: var(--bg); }

/* HEADER */
.header {
  background: linear-gradient(135deg, #1D1A39 0%, #451952 60%, #662549 100%);
  padding: 62px 22px 16px;
  position: relative;
  overflow: hidden;
}
.header-wave {
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 32px;
  background: var(--bg);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}
.header-blob-1 {
  position: absolute; width: 140px; height: 140px;
  border-radius: 50%; background: #F39F5A; opacity: 0.15;
  top: -40px; right: -30px;
}
.header-blob-2 {
  position: absolute; width: 80px; height: 80px;
  border-radius: 50%; background: #AE445A; opacity: 0.25;
  bottom: 10px; left: -20px;
}
.header-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 18px; position: relative;
}
.header-logo { display: flex; align-items: center; gap: 14px; }
.header-logo-icon {
  width: 64px; height: 64px; border-radius: 16px;
  overflow: hidden; flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(28,43,26,0.18);
}
.header-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
.header-logo-text {
  font-family: 'Fraunces', serif; font-size: 1.8rem; font-weight: 700;
  color: #E8BCB9; letter-spacing: -0.01em;
}
.header-logo-text span { color: #F39F5A; }
.sync-pill {
  background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 12px;
  font-size: 0.7rem; font-weight: 600; color: #E8BCB9;
}
.refresh-btn {
  background: rgba(255,255,255,0.15); border: none; border-radius: 50%;
  width: 34px; height: 34px; font-size: 1.2rem; color: #E8BCB9;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-weight: 700;
}
.refresh-btn:hover { background: rgba(255,255,255,0.25); transform: rotate(90deg); }
.header-greeting-label {
  font-size: 0.75rem; font-weight: 600; color: #F39F5A;
  letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px;
}
.header-greeting-title {
  font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 700;
  color: #E8BCB9; line-height: 1.1;
}
.header-greeting-title em { font-style: italic; color: #F39F5A; }

/* GOAL BANNER in header */
.goal-banner {
  margin-top: 8px; margin-bottom: 20px; background: var(--white);
  border-radius: 16px; padding: 14px 16px;
  box-shadow: var(--card-shadow); position: relative;
}
.goal-banner-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}
.goal-banner-label {
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--mid);
}
.goal-banner-count {
  font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700; color: var(--ink);
}
.goal-banner-count span { color: var(--sage-dark); }
.goal-track {
  height: 8px; background: var(--bg); border-radius: 10px; overflow: hidden;
}
.goal-fill {
  height: 100%; border-radius: 10px;
  background: linear-gradient(90deg, #1D1A39, #AE445A, #F39F5A);
  transition: width 0.5s ease;
}
.goal-fill.complete { background: linear-gradient(90deg, #F39F5A, #AE445A); }
.goal-edit-btn {
  background: var(--sage-pale);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  color: var(--mid);
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Nunito', sans-serif;
  padding: 3px 9px;
  white-space: nowrap;
  flex-shrink: 0;
}
.goal-edit-btn:hover { background: var(--sage-light); color: var(--ink); }
.goal-set-prompt {
  text-align: center; padding: 4px 0;
}
.goal-set-link {
  font-size: 0.8rem; font-weight: 700; color: var(--sage-dark); cursor: pointer;
  text-decoration: underline; font-family: 'Nunito', sans-serif;
  background: none; border: none;
}

/* NAV */
.nav {
  display: flex; justify-content: space-around; align-items: center;
  background: var(--white); border-top: 1px solid var(--border);
  padding: 8px 12px 16px;
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 50;
  box-shadow: 0 -2px 16px rgba(29,26,57,0.08);
}
.nav-btn {
  flex: 1; background: none; border: none; color: var(--mid);
  font-family: 'Nunito', sans-serif; font-size: 0.7rem; font-weight: 700;
  padding: 6px 4px; cursor: pointer;
  transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  border-radius: 16px;
}
.nav-btn svg { transition: stroke 0.2s; }
.nav-btn.active {
  color: #451952;
  background: #F5EEF0;
  border-radius: 16px;
  padding: 6px 10px;
}
.nav-btn.active::after { display: none; }

/* CONTAINER */
.container { max-width: 640px; margin: 0 auto; padding: 12px 16px 100px; }

/* CARDS */
.card {
  background: var(--white); border-radius: 20px; padding: 20px;
  margin-bottom: 14px; box-shadow: var(--card-shadow); border: 1px solid var(--border);
}

/* PAGE HEADER */
.page-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 18px;
}
.page-title {
  font-family: 'Fraunces', serif; font-size: 1.6rem;
  font-weight: 700; color: var(--ink); line-height: 1;
}
.page-count {
  font-size: 0.75rem; font-weight: 700; color: var(--mid);
  margin-top: 3px; letter-spacing: 0.04em; text-transform: uppercase;
}

/* BUTTONS */
.btn-add {
  background: var(--ink); color: #E8BCB9; border: none; border-radius: 14px;
  padding: 11px 20px; font-family: 'Nunito', sans-serif; font-size: 0.85rem;
  font-weight: 800; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 5px;
}
.btn-add:hover { background: var(--sage-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(29,26,57,0.2); }
.btn-add:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-primary {
  background: var(--sage-dark); color: #E8BCB9; border: none; border-radius: 14px;
  padding: 12px 22px; font-family: 'Nunito', sans-serif;
  font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: var(--ink); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-secondary {
  background: var(--sage-pale); color: var(--ink-soft);
  border: 1.5px solid var(--border); border-radius: 14px;
  padding: 11px 18px; font-family: 'Nunito', sans-serif;
  font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { background: var(--sage-light); border-color: var(--sage); }

.btn-ghost {
  background: none; border: none; color: var(--mid);
  font-family: 'Nunito', sans-serif; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; padding: 6px 10px; border-radius: 10px; transition: all 0.15s;
}
.btn-ghost:hover { background: var(--sage-pale); color: var(--ink); }
.btn-ghost.danger:hover { background: #FDE8E8; color: #C0392B; }
.btn-ghost.finish { color: #451952; }
.btn-ghost.finish:hover { background: #EDE0F0; color: #451952; }
.btn-row { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }

/* FORMS */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }
.form-label { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--mid); }
.form-input, .form-select, .form-textarea {
  background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px;
  padding: 11px 14px; font-family: 'Nunito', sans-serif; font-size: 0.9rem;
  font-weight: 500; color: var(--ink); outline: none;
  transition: border-color 0.2s, background 0.2s; width: 100%;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--sage-dark); background: var(--white);
}
.form-textarea { resize: vertical; min-height: 76px; }

/* FORMAT PILLS */
.format-row { display: flex; gap: 8px; flex-wrap: wrap; }
.format-pill {
  flex: 1; min-width: 80px; background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 10px 8px; font-family: 'Nunito', sans-serif;
  font-size: 0.8rem; font-weight: 700; color: var(--mid);
  cursor: pointer; transition: all 0.18s; text-align: center;
}
.format-pill.selected { background: var(--ink); border-color: var(--ink); color: var(--white); }
.format-pill:hover:not(.selected) { border-color: var(--sage-dark); color: var(--ink-soft); }

/* STARS */
.stars { display: flex; gap: 4px; }
.star { font-size: 1.4rem; cursor: pointer; color: var(--border); transition: color 0.12s; }
.star.lit { color: var(--accent); }

/* SEARCH */
.search-row { display: flex; gap: 8px; width: 100%; margin-bottom: 10px; }
.search-row .form-input { flex: 1; min-width: 0; }
.search-go {
  background: var(--sage-dark); color: var(--white); border: none; border-radius: 12px;
  padding: 11px 18px; font-family: 'Nunito', sans-serif; font-size: 0.85rem;
  font-weight: 800; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.2s;
}
.search-go:hover { background: var(--ink); }
.search-go:disabled { opacity: 0.5; cursor: not-allowed; }

.results-list {
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: 16px; max-height: 360px; overflow-y: auto; box-shadow: var(--card-shadow);
}
.result-row {
  display: flex; gap: 13px; padding: 13px 15px; border-bottom: 1px solid var(--bg);
  cursor: pointer; transition: background 0.12s; align-items: flex-start;
}
.result-row:last-of-type { border-bottom: none; }
.result-row:hover { background: var(--sage-pale); }
.result-thumb { width: 40px; height: 58px; object-fit: cover; border-radius: 7px; flex-shrink: 0; }
.result-thumb-ph {
  width: 40px; height: 58px; background: var(--sage-light); border-radius: 7px;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.result-title { font-family: 'Fraunces', serif; font-size: 0.92rem; font-weight: 600; color: var(--ink); line-height: 1.3; }
.result-author { font-size: 0.78rem; color: var(--mid); margin-top: 2px; font-weight: 500; }
.result-meta { font-size: 0.7rem; color: var(--sage-dark); margin-top: 3px; font-weight: 700; }
.manual-tip {
  text-align: center; padding: 12px; border-top: 1px solid var(--bg);
  font-size: 0.8rem; color: var(--mid); cursor: pointer; font-weight: 600;
}
.manual-tip:hover { color: var(--ink); }
.manual-tip span { text-decoration: underline; }
.no-results { padding: 24px; text-align: center; color: var(--mid); font-size: 0.88rem; }
.skip-link { font-size: 0.8rem; color: var(--mid); cursor: pointer; margin-top: 10px; display: block; text-align: right; font-weight: 600; }
.skip-link:hover { color: var(--ink); }
.skip-link span { text-decoration: underline; }

/* BOOK ITEMS */
.book-item {
  background: var(--white); border: 1px solid var(--border); border-radius: 18px;
  padding: 15px; margin-bottom: 12px; display: flex; gap: 14px;
  align-items: flex-start; box-shadow: var(--card-shadow);
  transition: transform 0.15s, box-shadow 0.15s;
}
.book-item:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(28,43,26,0.10); }
.book-cover-wrap { cursor: pointer; flex-shrink: 0; }
.book-cover { width: 56px; height: 80px; object-fit: cover; border-radius: 9px; display: block; box-shadow: 2px 3px 10px rgba(28,43,26,0.15); }
.book-cover-ph {
  width: 56px; height: 80px; border-radius: 9px;
  background: linear-gradient(145deg, var(--sage), var(--sage-dark));
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
  box-shadow: 2px 3px 10px rgba(28,43,26,0.15);
}
.book-info { flex: 1; min-width: 0; }
.book-title-link {
  font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700;
  color: var(--ink); line-height: 1.3; cursor: pointer;
  background: none; border: none; padding: 0; text-align: left; width: 100%;
}
.book-title-link:hover { color: var(--sage-dark); }
.book-author { font-size: 0.78rem; color: var(--mid); margin-top: 2px; font-weight: 500; }
.book-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; align-items: center; }
.tag {
  background: var(--sage-pale); border-radius: 20px; padding: 3px 10px;
  font-size: 0.68rem; font-weight: 700; color: var(--mid); letter-spacing: 0.02em;
}
.tag.t-format { background: var(--ink); color: var(--white); }
.tag.t-reading { background: #F5EEF0; color: #662549; }
.tag.t-done { background: #EDE0F0; color: #451952; }
.tag.t-want { background: var(--accent-light); color: #B06820; }
.book-stars { display: flex; gap: 1px; }
.book-star { font-size: 0.82rem; color: var(--border); }
.book-star.lit { color: var(--accent); }
.book-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.book-date { font-size: 0.7rem; color: var(--mid); margin-top: 5px; font-weight: 600; }
.book-notes { font-size: 0.78rem; color: var(--mid); margin-top: 6px; font-style: italic; line-height: 1.5; }

/* FORM COVER HEADER */
.form-cover-header {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--border);
}
.form-cover-img { width: 52px; height: 74px; object-fit: cover; border-radius: 8px; box-shadow: 2px 3px 10px rgba(28,43,26,0.14); flex-shrink: 0; }
.form-cover-title { font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 700; color: var(--ink); line-height: 1.3; }
.form-cover-author { font-size: 0.8rem; color: var(--mid); margin-top: 3px; }
.section-label { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mid); margin-bottom: 14px; }

/* CALENDAR */
.month-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.month-label { font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 700; color: var(--ink); }
.cal-nav-btn {
  background: var(--sage-pale); border: none; border-radius: 10px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1rem; color: var(--ink-soft); font-weight: 700; transition: all 0.15s;
}
.cal-nav-btn:hover { background: var(--ink); color: var(--white); }
.day-labels { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-bottom: 5px; }
.day-label { text-align: center; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mid); padding: 3px 0; }
.log-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }
.log-day {
  aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; cursor: pointer; background: var(--bg);
  transition: all 0.15s; font-size: 0.72rem; color: var(--ink-soft);
  gap: 1px; border: 1.5px solid transparent; font-weight: 600;
}
.log-day:hover { border-color: var(--sage-dark); background: var(--sage-pale); }
.log-day.read { background: linear-gradient(135deg, #451952, #AE445A); color: #E8BCB9; border-color: #451952; }
.log-day.today { border-color: var(--accent); }
.log-day.read.today { border-color: var(--ink); }
.log-day-num { font-weight: 800; font-size: 0.82rem; }
.log-book-label { font-size: 0.5rem; opacity: 0.85; text-align: center; line-height: 1.1; }
.log-hint { margin-top: 14px; font-size: 0.75rem; color: var(--mid); text-align: center; font-weight: 600; }

/* STATS */
.stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 11px; margin-bottom: 16px; }
.stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 16px 12px; text-align: center; box-shadow: var(--card-shadow); }
.stat-card.accent { background: linear-gradient(135deg, #1D1A39, #451952); border-color: #451952; }
.stat-num { font-family: 'Fraunces', serif; font-size: 2rem; font-weight: 700; color: var(--ink); line-height: 1; }
.stat-card.accent .stat-num { color: #E8BCB9; }
.stat-lbl { font-size: 0.64rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--mid); margin-top: 5px; }
.stat-card.accent .stat-lbl { color: rgba(255,255,255,0.65); }
.bar-row { margin-bottom: 15px; }
.bar-label-row { display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 7px; color: var(--ink-soft); }
.bar-count { color: var(--accent); font-weight: 800; }
.bar-track { background: var(--bg); border-radius: 6px; height: 6px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #451952, #AE445A); border-radius: 6px; transition: width 0.4s; }

/* GOAL SETTINGS card */
.goal-input-row { display: flex; gap: 10px; align-items: center; }
.goal-input-row .form-input { max-width: 100px; text-align: center; font-size: 1.1rem; font-weight: 800; }
.goal-year { font-size: 0.82rem; font-weight: 700; color: var(--mid); }
.goal-congrats {
  background: linear-gradient(135deg, var(--sage-pale), #E8F5E9);
  border: 1.5px solid var(--sage-light); border-radius: 14px;
  padding: 14px 16px; text-align: center; margin-bottom: 16px;
}
.goal-congrats-title { font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 700; color: var(--sage-dark); }
.goal-congrats-sub { font-size: 0.82rem; color: var(--mid); margin-top: 4px; font-weight: 600; }

/* MODAL / BOTTOM SHEET */
.modal-overlay { position: fixed; inset: 0; background: rgba(28,43,26,0.45); display: flex; align-items: flex-end; z-index: 100; }
.modal {
  background: var(--white); border-radius: 24px 24px 0 0;
  padding: 12px 22px 44px; width: 100%; max-height: 88vh; overflow-y: auto;
  box-shadow: 0 -6px 40px rgba(28,43,26,0.14);
}
.modal-handle { width: 38px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 18px; }
.modal-title { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 700; color: var(--ink); margin-bottom: 14px; }

/* BOOK DETAIL SHEET */
.detail-cover-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
.detail-cover { width: 80px; height: 116px; object-fit: cover; border-radius: 10px; flex-shrink: 0; box-shadow: 3px 4px 14px rgba(28,43,26,0.18); }
.detail-cover-ph {
  width: 80px; height: 116px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(145deg, var(--sage), var(--sage-dark));
  display: flex; align-items: center; justify-content: center; font-size: 2rem;
  box-shadow: 3px 4px 14px rgba(28,43,26,0.18);
}
.detail-title { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 700; color: var(--ink); line-height: 1.2; }
.detail-author { font-size: 0.85rem; color: var(--mid); margin-top: 4px; font-weight: 500; }
.detail-meta-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.detail-divider { height: 1px; background: var(--border); margin: 16px 0; }
.detail-section-label { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--mid); margin-bottom: 8px; }
.detail-synopsis { font-size: 0.88rem; line-height: 1.7; color: var(--ink-soft); font-weight: 500; }
.detail-synopsis-loading { font-size: 0.85rem; color: var(--mid); font-style: italic; }
.detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.detail-info-item { background: var(--bg); border-radius: 12px; padding: 12px 14px; }
.detail-info-item-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mid); margin-bottom: 4px; }
.detail-info-item-value { font-size: 0.9rem; font-weight: 700; color: var(--ink); }
.detail-stars { display: flex; gap: 3px; }
.detail-star { font-size: 1rem; color: var(--border); }
.detail-star.lit { color: var(--accent); }
.detail-notes { font-size: 0.85rem; line-height: 1.6; color: var(--ink-soft); font-style: italic; font-weight: 500; }

/* LOG MODAL */
.log-option {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border: 1.5px solid var(--border); border-radius: 14px; cursor: pointer;
  margin-bottom: 8px; transition: all 0.15s; background: var(--white);
}
.log-option:hover { border-color: var(--sage-dark); background: var(--sage-pale); }
.log-option.selected { background: var(--sage-dark); border-color: var(--sage-dark); color: var(--white); }
.log-option-cover { width: 30px; height: 42px; object-fit: cover; border-radius: 5px; flex-shrink: 0; }
.log-option-text { font-size: 0.88rem; font-weight: 700; }
.log-option-sub { font-size: 0.72rem; opacity: 0.65; margin-top: 1px; }

/* EMPTY */
.empty { text-align: center; padding: 52px 20px; color: var(--mid); }
.empty-icon { font-size: 2.8rem; margin-bottom: 14px; }
.empty-title { font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 700; color: var(--ink-soft); margin-bottom: 6px; }
.empty-sub { font-size: 0.85rem; font-weight: 500; line-height: 1.5; }

/* TOAST */
.toast {
  position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
  background: var(--ink); color: var(--white); padding: 11px 24px; border-radius: 22px;
  font-family: 'Nunito', sans-serif; font-size: 0.83rem; font-weight: 700;
  z-index: 200; opacity: 0; transition: opacity 0.25s; pointer-events: none;
  white-space: nowrap; box-shadow: 0 4px 20px rgba(28,43,26,0.22);
}
.toast.show { opacity: 1; }

/* LOADING */
.loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 55vh; font-family: 'Fraunces', serif; font-style: italic;
  font-size: 1.1rem; color: var(--mid);
}

@media(max-width:560px) {
  .form-grid { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .container { padding: 18px 14px 80px; }
  .header { padding: 48px 18px 30px; }
  .detail-info-grid { grid-template-columns: 1fr 1fr; }
}
`;

const FORMATS = ["📖 Physical","📱 Digital","🎧 Audiobook"];
const STATUSES = ["Want to Read","Reading","Finished"];
const GENRES = ["Fiction","Non-Fiction","Literary Fiction","Romance","Mystery","Sci-Fi","Fantasy","Biography","History","Poetry","Other"];
const today = new Date();
const todayStr = today.toISOString().slice(0,10);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = today.getFullYear();

const QUOTES = [
  '"A reader lives a thousand lives before he dies." — George R.R. Martin',
  '"Not all those who wander are lost." — J.R.R. Tolkien',
  '"So many books, so little time." — Frank Zappa',
  '"One must always be careful of books." — Cassandra Clare',
  '"There is no friend as loyal as a book." — Ernest Hemingway',
  '"Books are a uniquely portable magic." — Stephen King',
  '"Reading is dreaming with open eyes." — Anissa Trisdiani',
  '"A book is a dream you hold in your hands." — Neil Gaiman',
  '"She is too fond of books, and it has turned her brain." — Louisa May Alcott',
  '"I am not afraid of storms, for I am learning to sail my ship." — Louisa May Alcott',
  '"It is our choices that show what we truly are." — J.K. Rowling',
  '"Words are, in my not-so-humble opinion, our most inexhaustible source of magic." — J.K. Rowling',
  '"The world is a book, and those who do not travel read only one page." — Saint Augustine',
  '"Literature is the most agreeable way of ignoring life." — Fernando Pessoa',
  '"Reading is to the mind what exercise is to the body." — Joseph Addison',
  '"Once you learn to read, you will be forever free." — Frederick Douglass',
  '"There are worse crimes than burning books. One of them is not reading them." — Joseph Brodsky',
  '"You can never get a cup of tea large enough or a book long enough to suit me." — C.S. Lewis',
  '"I kept always two books in my pocket: one to read, one to write in." — Robert Louis Stevenson',
  '"Books are mirrors: we only see in them what we already have inside us." — Carlos Ruiz Zafón',
  '"Reading gives us someplace to go when we have to stay where we are." — Mason Cooley',
  '"The more that you read, the more things you will know." — Dr. Seuss',
  '"If you only read the books that everyone else is reading, you can only think what everyone else is thinking." — Haruki Murakami',
  '"A room without books is like a body without a soul." — Marcus Tullius Cicero',
  '"Think before you speak. Read before you think." — Fran Lebowitz',
  '"Books are the plane, and the train, and the road. They are the destination, and the journey." — Anna Quindlen',
  '"You don\'t have to burn books to destroy a culture. Just get people to stop reading them." — Ray Bradbury',
  '"I find television very educating. Every time somebody turns on the set, I go in the other room and read a book." — Groucho Marx',
  '"Classic — a book which people praise and don\'t read." — Mark Twain',
  '"Sleep is good, he said, and books are better." — George R.R. Martin',
  '"A book must be the axe for the frozen sea within us." — Franz Kafka',
];
const emptyForm = { title:'',author:'',genre:'',format:'',status:'Want to Read',start_date:'',end_date:'',total_pages:'',rating:0,notes:'',cover_url:'',gb_id:'' };

// Icon — daughter's illustration hosted in the repo's public folder
const ICON_URL = "/icon.png";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n=>(
        <span key={n} className={`star ${n<=(hover||value)?'lit':''}`}
          onClick={()=>onChange(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}>★</span>
      ))}
    </div>
  );
}

function BookSearch({ onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setBusy(true);
      try { setResults(await searchGoogleBooks(q)); }
      catch { setResults([]); }
      setBusy(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div>
      <div className="form-label" style={{marginBottom:8}}>Search by title or author</div>
      <div style={{position:'relative'}}>
        <input className="form-input" value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Start typing a title or author…" autoComplete="off" autoFocus
          style={{paddingRight: busy ? 40 : 14}} />
        {busy && <div style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:'0.75rem',color:'var(--mid)'}}>⏳</div>}
      </div>
      {results !== null && (
        <div className="results-list">
          {results.length===0 && !busy && <div className="no-results">No results — try a different search.</div>}
          {results.map((r,i)=>(
            <div key={i} className="result-row" onClick={()=>onSelect(r)}>
              {r.cover_url
                ? <img src={r.cover_url} alt={r.title} className="result-thumb" onError={e=>e.target.style.display='none'} />
                : <div className="result-thumb-ph">📖</div>}
              <div>
                <div className="result-title">{r.title}</div>
                {r.author && <div className="result-author">by {r.author}</div>}
                <div className="result-meta">{[r.year&&`${r.year}`,r.pages&&`${r.pages} pages`].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
          ))}
          <div className="manual-tip" onClick={()=>onSelect(null)}>Don't see it? <span>Enter manually →</span></div>
        </div>
      )}
      {results===null && (
        <div className="skip-link" onClick={()=>onSelect(null)}><span>Skip — enter manually →</span></div>
      )}
    </div>
  );
}

// Book Detail Bottom Sheet
function BookDetailSheet({ book, onClose, onEdit }) {
  const [synopsis, setSynopsis] = useState(null); // null = loading, '' = none found

  useEffect(()=>{
    if (!book) return;
    setSynopsis(null);
    if (book.gb_id) {
      fetchBookDetails(book.gb_id).then(s => setSynopsis(s));
    } else {
      setSynopsis('');
    }
  }, [book]);

  if (!book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>

        {/* Cover + title */}
        <div className="detail-cover-row">
          {book.cover_url
            ? <img src={book.cover_url} alt={book.title} className="detail-cover" onError={e=>e.target.style.display='none'} />
            : <div className="detail-cover-ph">📖</div>}
          <div style={{flex:1}}>
            <div className="detail-title">{book.title}</div>
            {book.author && <div className="detail-author">by {book.author}</div>}
            <div className="detail-meta-row">
              {book.format && <span className="tag t-format">{book.format}</span>}
              {book.genre && <span className="tag">{book.genre}</span>}
              {book.status && <span className={`tag ${book.status==='Reading'?'t-reading':book.status==='Finished'?'t-done':'t-want'}`}>{book.status}</span>}
            </div>
            {book.rating>0 && (
              <div className="detail-stars" style={{marginTop:8}}>
                {[1,2,3,4,5].map(n=><span key={n} className={`detail-star ${n<=book.rating?'lit':''}`}>★</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="detail-info-grid" style={{marginBottom:16}}>
          {book.total_pages && (
            <div className="detail-info-item">
              <div className="detail-info-item-label">Pages</div>
              <div className="detail-info-item-value">{book.total_pages}</div>
            </div>
          )}
          {book.start_date && (
            <div className="detail-info-item">
              <div className="detail-info-item-label">Started</div>
              <div className="detail-info-item-value">{book.start_date}</div>
            </div>
          )}
          {book.end_date && (
            <div className="detail-info-item">
              <div className="detail-info-item-label">Finished</div>
              <div className="detail-info-item-value">{book.end_date}</div>
            </div>
          )}
        </div>

        {/* Synopsis */}
        <div className="detail-divider"/>
        <div className="detail-section-label">About This Book</div>
        {synopsis === null && <div className="detail-synopsis-loading">Fetching synopsis…</div>}
        {synopsis === '' && <div className="detail-synopsis-loading">No synopsis available for this book.</div>}
        {synopsis && <div className="detail-synopsis">{synopsis}</div>}

        {/* Notes */}
        {book.notes && <>
          <div className="detail-divider"/>
          <div className="detail-section-label">My Notes</div>
          <div className="detail-notes">"{book.notes}"</div>
        </>}

        <div className="btn-row" style={{marginTop:20}}>
          <button className="btn-primary" onClick={()=>{onEdit(book);onClose();}}>Edit Book</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Goal Banner
function GoalBanner({ books, goalYear, onSetGoal }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(goalYear||'');

  const finishedThisYear = books.filter(b => b.status==='Finished' && b.end_date && b.end_date.startsWith(String(CURRENT_YEAR))).length;

  function save() {
    const n = parseInt(inputVal);
    if (n > 0) { onSetGoal(n); setEditing(false); }
  }

  if (editing) {
    return (
      <div className="goal-banner">
        <div className="section-label" style={{marginBottom:10}}>Set Your {CURRENT_YEAR} Reading Goal</div>
        <div className="goal-input-row">
          <input className="form-input" type="number" min="1" max="365"
            value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&save()} placeholder="e.g. 24" autoFocus />
          <span className="goal-year">books in {CURRENT_YEAR}</span>
        </div>
        <div className="btn-row" style={{marginTop:12}}>
          <button className="btn-primary" style={{padding:'9px 18px',fontSize:'0.8rem'}} onClick={save}>Save Goal</button>
          <button className="btn-secondary" style={{padding:'8px 14px',fontSize:'0.8rem'}} onClick={()=>setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  if (!goalYear) {
    return (
      <div className="goal-banner">
        <div className="goal-set-prompt">
          <div className="goal-banner-label" style={{marginBottom:6}}>📚 Reading Goal</div>
          <button className="goal-set-link" onClick={()=>setEditing(true)}>Set your {CURRENT_YEAR} reading goal →</button>
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((finishedThisYear / goalYear) * 100));
  const complete = finishedThisYear >= goalYear;

  return (
    <div className="goal-banner">
      <div className="goal-banner-row">
        <div className="goal-banner-label">{CURRENT_YEAR} Reading Goal</div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div className="goal-banner-count">
            <span>{finishedThisYear}</span> / {goalYear} books
          </div>
          <button className="goal-edit-btn" onClick={()=>{ setInputVal(goalYear); setEditing(true); }}>Edit</button>
        </div>
      </div>
      <div className="goal-track">
        <div className={`goal-fill ${complete?'complete':''}`} style={{width:`${pct}%`}}/>
      </div>
      {complete && (
        <div style={{fontSize:'0.75rem',fontWeight:700,color:'#4CAF50',marginTop:8,textAlign:'center'}}>
          🎉 Goal reached! You're on a roll!
        </div>
      )}
      {!complete && (
        <div style={{fontSize:'0.72rem',color:'var(--mid)',marginTop:7,textAlign:'right',fontWeight:600}}>
          {goalYear - finishedThisYear} more to go · {pct}%
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [books, setBooks] = useState([]);
  const [logMap, setLogMap] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [mode, setMode] = useState('list');
  const [logModal, setLogModal] = useState(null);
  const [logBook, setLogBook] = useState([]);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [detailBook, setDetailBook] = useState(null);
  const [goalYear, setGoalYear] = useState(() => {
    const saved = localStorage.getItem('bookishtee_goal');
    return saved ? parseInt(saved) : null;
  });
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterGenre, setFilterGenre] = useState('All');

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),2500); }

  function handleSetGoal(n) {
    setGoalYear(n);
    try { localStorage.setItem('bookishtee_goal', String(n)); } catch {}
    showToast(`Goal set: ${n} books in ${CURRENT_YEAR} 🎯`);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b,l] = await Promise.all([
        sbGet('books','order=created_at.asc'),
        sbGet('reading_log','order=log_date.asc')
      ]);
      setBooks(Array.isArray(b)?b:[]);
      const lm={};
      if(Array.isArray(l)) l.forEach(x=>{
        if(!lm[x.log_date]) lm[x.log_date]=[];
        lm[x.log_date].push(x);
      });
      setLogMap(lm);
    } catch { showToast('Could not reach cloud.'); }
    setLoading(false);
  },[]);

  useEffect(()=>{loadData();},[loadData]);

  function startAdd() { setForm(emptyForm); setEditId(null); setMode('search'); }
  function onSearchSelect(r) {
    if(r) setForm(f=>({...f,
      title:r.title||'', author:r.author||'',
      total_pages:r.pages?String(r.pages):'',
      cover_url:r.cover_url||'', genre:r.genre||'',
      gb_id:r.gb_id||''
    }));
    setMode('form');
  }

  async function saveBook() {
    if(!form.title.trim()) return;
    setSaving(true);
    try {
      const p = {
        title:form.title, author:form.author||null, genre:form.genre||null,
        format:form.format||null, status:form.status,
        start_date:form.start_date||null, end_date:form.end_date||null,
        total_pages:form.total_pages?parseInt(form.total_pages):null,
        rating:form.rating||0, notes:form.notes||null, cover_url:form.cover_url||null,
        gb_id:form.gb_id||null
      };
      if(editId){await sbUpdate('books',editId,p);showToast('Book updated ✓');}
      else{await sbInsert('books',p);showToast('Added to your shelf ✓');}
      await loadData();
      setForm(emptyForm); setEditId(null); setMode('list');
    } catch { showToast('Error saving. Try again.'); }
    setSaving(false);
  }

  async function markFinished(b) {
    setSaving(true);
    const endDate = today.toISOString().slice(0,10);
    await sbUpdate('books', b.id, { status: 'Finished', end_date: endDate });
    showToast(`"${b.title}" marked as finished 🎉`);
    await loadData();
    setSaving(false);
  }

  async function deleteBook(id) {
    setSaving(true);
    await sbDelete('books',id);
    showToast('Book removed');
    await loadData();
    setSaving(false);
  }

  function editBook(b) {
    setForm({...b, total_pages:b.total_pages||'', start_date:b.start_date||'', end_date:b.end_date||'', cover_url:b.cover_url||'', gb_id:b.gb_id||''});
    setEditId(b.id); setMode('form'); setTab('library');
  }

  function openLog(dateStr) {
    const existing = logMap[dateStr] || [];
    setLogBook(existing.map(e => e.book_id).filter(Boolean));
    setLogModal(dateStr);
  }

  async function saveLog() {
    if(!logModal) return;
    setSaving(true);
    try {
      // Delete all existing entries for this date
      await sbDeleteWhere('reading_log','log_date',logModal);
      // Insert new entries
      if(logBook.length > 0) {
        for(const bookId of logBook) {
          await sbInsert('reading_log',{log_date:logModal, book_id:bookId});
        }
        showToast('Reading logged ✓');
      } else {
        showToast('Log cleared');
      }
      await loadData();
    } catch { showToast('Error saving log.'); }
    setSaving(false); setLogModal(null);
  }

  const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
  const firstDay = new Date(calYear,calMonth,1).getDay();
  const finishedCount = books.filter(b=>b.status==='Finished').length;
  const finishedThisYear = books.filter(b=>b.status==='Finished' && b.end_date && b.end_date.startsWith(String(CURRENT_YEAR))).length;
  const currentlyReading = books.filter(b=>b.status==='Reading');
  function stTag(s){if(s==='Reading')return 't-reading';if(s==='Finished')return 't-done';return 't-want';}

  // Reading streak — counts back from yesterday so today's log is optional
  const readingStreak = (() => {
    let streak = 0;
    const check = new Date(today);
    // If today is already logged, count it and go back from there
    // If not, start checking from yesterday
    const todayKey = check.toISOString().slice(0,10);
    if (!logMap[todayKey]) check.setDate(check.getDate()-1);
    while (true) {
      const key = check.toISOString().slice(0,10);
      if (logMap[key]) { streak++; check.setDate(check.getDate()-1); }
      else break;
    }
    return streak;
  })();

  // Library filters
  const allGenres = ['All', ...Array.from(new Set(books.map(b=>b.genre).filter(Boolean))).sort()];
  const filteredBooks = books.filter(b => {
    const statusOk = filterStatus === 'All' || b.status === filterStatus;
    const genreOk = filterGenre === 'All' || b.genre === filterGenre;
    return statusOk && genreOk;
  });

  if(loading) return (
    <><style>{FONTS}{STYLES}</style>
    <div className="app">
      <div className="header">
        <div className="header-blob-1"/><div className="header-blob-2"/>
        <div className="header-top">
          <div className="header-logo">
            <div className="header-logo-text">Bookish<span>Tee</span></div>
          </div>
        </div>
      </div>
      <div className="loading">Loading your shelf…</div>
    </div></>
  );

  return (
    <><style>{FONTS}{STYLES}</style>
    <div className="app">

      {/* HEADER */}
      <div className="header">
        <div className="header-blob-1"/><div className="header-blob-2"/>
        <div className="header-wave"/>
        <div className="header-top">
          <div className="header-logo">
            <div className="header-logo-text">Bookish<span>Tee</span></div>
          </div>
          {saving && <div className="sync-pill">Syncing…</div>}
          {!saving && <button className="refresh-btn" onClick={loadData} title="Refresh">↻</button>}
        </div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <button className={`nav-btn ${tab==='home'?'active':''}`} onClick={()=>setTab('home')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/>
          </svg>
          Home
        </button>
        <button className={`nav-btn ${tab==='library'?'active':''}`} onClick={()=>setTab('library')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Library
        </button>
        <button className={`nav-btn ${tab==='log'?'active':''}`} onClick={()=>setTab('log')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Log
        </button>
        <button className={`nav-btn ${tab==='stats'?'active':''}`} onClick={()=>setTab('stats')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Stats
        </button>
      </nav>

      <div className="container">

        {/* ── HOME ── */}
        {tab==='home' && <>
          <div style={{paddingBottom:8,paddingTop:4}}>
            <div className="header-greeting-label" style={{marginBottom:4}}>Welcome back</div>
            <div className="header-greeting-title" style={{fontSize:'1.6rem',marginBottom:20}}>Your Reading <em>Life</em></div>
          </div>

          {/* Goal Progress */}
          <GoalBanner books={books} goalYear={goalYear} onSetGoal={handleSetGoal} />

          {/* Streak */}
          <div className="card" style={{marginBottom:14,display:'flex',alignItems:'center',gap:16,padding:'14px 18px'}}>
            <div style={{fontSize:'2.2rem',lineHeight:1}}>🔥</div>
            <div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.5rem',fontWeight:700,color:'var(--ink)',lineHeight:1}}>
                {readingStreak} <span style={{fontSize:'0.9rem',fontWeight:600,color:'var(--mid)'}}>day{readingStreak!==1?'s':''}</span>
              </div>
              <div style={{fontSize:'0.75rem',color:'var(--mid)',fontWeight:600,marginTop:2}}>
                {readingStreak===0 ? 'Log a day to start your streak!' : readingStreak===1 ? 'Streak started — keep it going!' : 'Reading streak 🎉'}
              </div>
            </div>
          </div>

          {/* Currently Reading */}
          <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.2rem',fontWeight:700,color:'var(--ink)',marginBottom:12}}>
            Currently Reading
          </div>
          {currentlyReading.length===0 ? (
            <div className="card" style={{textAlign:'center',padding:'32px 20px'}}>
              <div style={{fontSize:'2rem',marginBottom:10}}>📖</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'1rem',color:'var(--ink-soft)',fontWeight:600}}>Nothing in progress</div>
              <div style={{fontSize:'0.82rem',color:'var(--mid)',marginTop:6,marginBottom:16}}>Head to Library to start a book!</div>
              <button className="btn-primary" style={{fontSize:'0.8rem',padding:'9px 18px'}} onClick={()=>setTab('library')}>Go to Library →</button>
            </div>
          ) : (
            currentlyReading.map(b=>(
              <div key={b.id} className="book-item" style={{cursor:'pointer'}} onClick={()=>setDetailBook(b)}>
                {b.cover_url
                  ? <img src={b.cover_url} alt={b.title} className="book-cover" onError={e=>e.target.style.display='none'} />
                  : <div className="book-cover-ph">📖</div>}
                <div className="book-info">
                  <div className="book-title">{b.title}</div>
                  {b.author && <div className="book-author">by {b.author}</div>}
                  <div className="book-meta">
                    {b.format && <span className="tag t-format">{b.format}</span>}
                    {b.genre && <span className="tag">{b.genre}</span>}
                  </div>
                  {b.total_pages && <div className="book-date">{b.total_pages} pages</div>}
                </div>
                <div style={{fontSize:'1.3rem',color:'var(--mid)',alignSelf:'center'}}>›</div>
              </div>
            ))
          )}

          {/* Want to Read next */}
          {books.filter(b=>b.status==='Want to Read').length > 0 && <>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.2rem',fontWeight:700,color:'var(--ink)',marginBottom:12,marginTop:8}}>
              Up Next
            </div>
            {books.filter(b=>b.status==='Want to Read').slice(0,3).map(b=>(
              <div key={b.id} className="book-item" style={{cursor:'pointer'}} onClick={()=>setDetailBook(b)}>
                {b.cover_url
                  ? <img src={b.cover_url} alt={b.title} className="book-cover" onError={e=>e.target.style.display='none'} />
                  : <div className="book-cover-ph">📖</div>}
                <div className="book-info">
                  <div className="book-title">{b.title}</div>
                  {b.author && <div className="book-author">by {b.author}</div>}
                  <div className="book-meta">
                    <span className="tag t-want">Want to Read</span>
                    {b.genre && <span className="tag">{b.genre}</span>}
                  </div>
                </div>
                <div style={{fontSize:'1.3rem',color:'var(--mid)',alignSelf:'center'}}>›</div>
              </div>
            ))}
          </>}
        </>}

        {/* ── LIBRARY ── */}
        {tab==='library' && <>
          <div className="page-header">
            <div>
              <div className="page-title">My Library</div>
              {books.length > 0 && <div className="page-count">{filteredBooks.length} of {books.length} book{books.length!==1?'s':''}</div>}
            </div>
            {mode==='list' && <button className="btn-add" onClick={startAdd}>+ Add Book</button>}
          </div>

          {/* Filters */}
          {mode==='list' && books.length > 0 && (
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4}}>
                {['All','Reading','Finished','Want to Read'].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)}
                    style={{flexShrink:0,padding:'6px 14px',borderRadius:20,border:'1.5px solid',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                      background: filterStatus===s ? 'var(--sage-dark)' : 'var(--white)',
                      borderColor: filterStatus===s ? 'var(--sage-dark)' : 'var(--border)',
                      color: filterStatus===s ? '#E8BCB9' : 'var(--mid)'}}>
                    {s}
                  </button>
                ))}
              </div>
              {allGenres.length > 2 && (
                <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginTop:6}}>
                  {allGenres.map(g=>(
                    <button key={g} onClick={()=>setFilterGenre(g)}
                      style={{flexShrink:0,padding:'5px 12px',borderRadius:20,border:'1.5px solid',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                        background: filterGenre===g ? 'var(--ink)' : 'var(--white)',
                        borderColor: filterGenre===g ? 'var(--ink)' : 'var(--border)',
                        color: filterGenre===g ? '#E8BCB9' : 'var(--mid)'}}>
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode==='search' && (
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:'1.15rem',fontWeight:700,color:'var(--ink)',marginBottom:16}}>Find a Book</div>
              <BookSearch onSelect={onSearchSelect} />
              <div className="btn-row">
                <button className="btn-secondary" onClick={()=>setMode('list')}>Cancel</button>
              </div>
            </div>
          )}

          {mode==='form' && (
            <div className="card" style={{marginBottom:16}}>
              {(form.cover_url||form.title) && (
                <div className="form-cover-header">
                  {form.cover_url && <img src={form.cover_url} alt="cover" className="form-cover-img" onError={e=>e.target.style.display='none'} />}
                  <div>
                    <div className="form-cover-title">{form.title||'New Book'}</div>
                    {form.author && <div className="form-cover-author">by {form.author}</div>}
                  </div>
                </div>
              )}
              <div className="form-grid">
                <div className="form-group"><div className="form-label">Title</div><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Book title" /></div>
                <div className="form-group"><div className="form-label">Author</div><input className="form-input" value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} placeholder="Author name" /></div>
                <div className="form-group"><div className="form-label">Genre</div>
                  <select className="form-select" value={form.genre} onChange={e=>setForm(f=>({...f,genre:e.target.value}))}>
                    <option value="">Select genre</option>
                    {GENRES.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group"><div className="form-label">Status</div>
                  <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full"><div className="form-label">Format</div>
                  <div className="format-row">
                    {FORMATS.map(fmt=>(
                      <button key={fmt} className={`format-pill ${form.format===fmt?'selected':''}`} onClick={()=>setForm(f=>({...f,format:fmt}))}>{fmt}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group"><div className="form-label">Start Date</div><input className="form-input" type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} /></div>
                <div className="form-group"><div className="form-label">End Date</div><input className="form-input" type="date" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} /></div>
                <div className="form-group"><div className="form-label">Pages</div><input className="form-input" type="number" value={form.total_pages} onChange={e=>setForm(f=>({...f,total_pages:e.target.value}))} placeholder="e.g. 320" /></div>
                <div className="form-group"><div className="form-label">Rating</div><StarRating value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))} /></div>
                <div className="form-group full"><div className="form-label">Notes</div><textarea className="form-textarea" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Your thoughts…" /></div>
              </div>
              <div className="btn-row">
                <button className="btn-primary" onClick={saveBook} disabled={saving}>{saving?'Saving…':editId?'Save Changes':'Add to Shelf'}</button>
                {!editId && <button className="btn-secondary" onClick={()=>setMode('search')}>← Search</button>}
                <button className="btn-secondary" onClick={()=>{setMode('list');setEditId(null);setForm(emptyForm);}}>Cancel</button>
              </div>
            </div>
          )}

          {books.length===0 && mode==='list' && (
            <div className="empty">
              <div className="empty-icon">📖</div>
              <div className="empty-title">Your shelf is empty</div>
              <div className="empty-sub">Tap + Add Book to start tracking<br/>your reading journey.</div>
            </div>
          )}

          {mode==='list' && books.length > 0 && filteredBooks.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No matches</div>
              <div className="empty-sub">Try a different filter.</div>
            </div>
          )}

          {mode==='list' && filteredBooks.map(b=>(
            <div key={b.id} className="book-item">
              <div className="book-cover-wrap" onClick={()=>setDetailBook(b)}>
                {b.cover_url
                  ? <img src={b.cover_url} alt={b.title} className="book-cover" onError={e=>e.target.style.display='none'} />
                  : <div className="book-cover-ph">📖</div>}
              </div>
              <div className="book-info">
                <button className="book-title-link" onClick={()=>setDetailBook(b)}>{b.title}</button>
                {b.author && <div className="book-author">by {b.author}</div>}
                <div className="book-meta">
                  {b.format && <span className="tag t-format">{b.format}</span>}
                  {b.genre && <span className="tag">{b.genre}</span>}
                  {b.status && <span className={`tag ${stTag(b.status)}`}>{b.status}</span>}
                  {b.rating>0 && <span className="book-stars">{[1,2,3,4,5].map(n=><span key={n} className={`book-star ${n<=b.rating?'lit':''}`}>★</span>)}</span>}
                </div>
                {(b.start_date||b.end_date) && (
                  <div className="book-date">
                    {b.start_date&&`Started ${b.start_date}`}{b.start_date&&b.end_date&&' · '}{b.end_date&&`Finished ${b.end_date}`}
                  </div>
                )}
                {b.notes && <div className="book-notes">"{b.notes}"</div>}
              </div>
              <div className="book-actions">
                {b.status==='Reading' && (
                  <button className="btn-ghost finish" onClick={()=>markFinished(b)}>✓ Finished</button>
                )}
                <button className="btn-ghost" onClick={()=>editBook(b)}>Edit</button>
                <button className="btn-ghost danger" onClick={()=>deleteBook(b.id)}>✕</button>
              </div>
            </div>
          ))}
        </>}

        {/* ── LOG ── */}
        {tab==='log' && (
          <div className="card">
            <div className="month-nav">
              <button className="cal-nav-btn" onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}}>‹</button>
              <div className="month-label">{MONTHS[calMonth]} {calYear}</div>
              <button className="cal-nav-btn" onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}}>›</button>
            </div>
            <div className="day-labels">
              {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} className="day-label">{d}</div>)}
            </div>
            <div className="log-grid">
              {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} />)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1;
                const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const entries=logMap[dateStr]||[];
                const hasLog=entries.length>0;
                const isToday=dateStr===todayStr;
                const count=entries.length;
                return (
                  <div key={day} className={`log-day ${hasLog?'read':''} ${isToday?'today':''}`} onClick={()=>openLog(dateStr)}>
                    <span className="log-day-num">{day}</span>
                    {hasLog && <span className="log-book-label">{count>1?`${count} books`:'✓'}</span>}
                  </div>
                );
              })}
            </div>
            <div className="log-hint">Tap any day to mark it. Purple = read that day.</div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab==='stats' && <>
          {goalYear && (
            <div className="goal-congrats" style={finishedThisYear>=goalYear?{}:{background:'var(--white)',border:'1px solid var(--border)'}}>
              {finishedThisYear>=goalYear
                ? <><div className="goal-congrats-title">🎉 Goal Reached!</div><div className="goal-congrats-sub">You've finished {finishedThisYear} of {goalYear} books in {CURRENT_YEAR}</div></>
                : <><div className="goal-congrats-title" style={{color:'var(--ink)'}}>📚 {CURRENT_YEAR} Goal</div><div className="goal-congrats-sub">{finishedThisYear} of {goalYear} books finished · {Math.round((finishedThisYear/goalYear)*100)}% complete</div></>
              }
            </div>
          )}

          <div className="stats-row">
            <div className="stat-card accent"><div className="stat-num">{books.length}</div><div className="stat-lbl">Total</div></div>
            <div className="stat-card"><div className="stat-num">{finishedThisYear}</div><div className="stat-lbl">{CURRENT_YEAR}</div></div>
            <div className="stat-card"><div className="stat-num">{Object.keys(logMap).length}</div><div className="stat-lbl">Days Read</div></div>
          </div>

          <div className="card">
            <div className="section-label">By Format</div>
            {FORMATS.map(fmt=>{
              const count=books.filter(b=>b.format===fmt).length;
              const pct=books.length?Math.round((count/books.length)*100):0;
              return (
                <div key={fmt} className="bar-row">
                  <div className="bar-label-row"><span>{fmt}</span><span className="bar-count">{count}</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{width:`${pct}%`}} /></div>
                </div>
              );
            })}
            {books.length===0 && <div style={{color:'var(--mid)',fontSize:'0.85rem',fontStyle:'italic'}}>No books yet.</div>}
          </div>
        </>}

      </div>
    </div>

    {/* BOOK DETAIL SHEET */}
    <BookDetailSheet book={detailBook} onClose={()=>setDetailBook(null)} onEdit={editBook} />

    {/* LOG MODAL */}
    {logModal && (
      <div className="modal-overlay" onClick={()=>setLogModal(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="modal-title">What did you read on {logModal}?</div>
          <div style={{fontSize:'0.75rem',color:'var(--mid)',marginBottom:12,textAlign:'center'}}>Tap to select — you can pick more than one</div>
          <div className={`log-option ${logBook.length===0?'selected':''}`} onClick={()=>setLogBook([])}>
            <span style={{fontSize:'1.1rem'}}>✕</span>
            <div><div className="log-option-text">No reading today</div></div>
          </div>
          {currentlyReading.length === 0 && (
            <div style={{textAlign:'center',padding:'16px 0',color:'var(--mid)',fontSize:'0.85rem',fontStyle:'italic'}}>
              No books in progress — mark a book as "Reading" in your Library first.
            </div>
          )}
          {currentlyReading.map(b=>{
            const selected = logBook.includes(b.id);
            return (
              <div key={b.id} className={`log-option ${selected?'selected':''}`}
                onClick={()=>setLogBook(prev => selected ? prev.filter(id=>id!==b.id) : [...prev, b.id])}>
                {b.cover_url
                  ? <img src={b.cover_url} alt={b.title} className="log-option-cover" onError={e=>e.target.style.display='none'} />
                  : <span style={{fontSize:'1.1rem'}}>📖</span>}
                <div style={{flex:1}}>
                  <div className="log-option-text">{b.title}</div>
                  {b.author && <div className="log-option-sub">by {b.author}</div>}
                  {b.format && <div className="log-option-sub">{b.format}</div>}
                </div>
                {selected && <span style={{fontSize:'1.1rem',marginLeft:'auto'}}>✓</span>}
              </div>
            );
          })}
          <div className="btn-row" style={{marginTop:18}}>
            <button className="btn-primary" onClick={saveLog} disabled={saving}>{saving?'Saving…':'Save'}</button>
            <button className="btn-secondary" onClick={()=>setLogModal(null)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

    <div className={`toast ${toast?'show':''}`}>{toast}</div>
    </>
  );
}
