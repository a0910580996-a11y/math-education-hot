const publication = JSON.parse(document.querySelector('#publication').textContent);
const articles = [...document.querySelectorAll('article')];
const search = document.querySelector('#search');
const issueSelect = document.querySelector('#issue-select');
let channel = 'all';
let view = 'week';
let saved = new Set();
try { const value = JSON.parse(localStorage.getItem('mathhot-saved') || '[]'); if (Array.isArray(value)) saved = new Set(value.filter(x => typeof x === 'string')); } catch { /* Reading works when storage is unavailable. */ }

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const issue = publication.issues.find(i => i.id === issueSelect.value) || publication.issues[0];
  document.querySelector('#reading').hidden = view === 'sources';
  document.querySelector('#source-panel').hidden = view !== 'sources';
  document.querySelector('#page-title').textContent = {week:'本周精选',archive:'周报档案',sources:'信源目录'}[view];
  document.querySelector('#issue-date').textContent = `${issue.date.replaceAll('-', '.')} · ${issue.label}`;
  document.querySelector('#issue-lead').textContent = view === 'sources' ? '追溯证据，也看清证据的边界。' : issue.lead;
  document.querySelector('#archive-count').textContent = `共 ${publication.issues.length} 期`;
  document.querySelectorAll('[data-view]').forEach(b => { if (b.dataset.view === view) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  document.querySelectorAll('button[data-channel]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.channel === channel)));
  let count = 0;
  for (const article of articles) {
    const visible = (query || channel === 'saved' || article.dataset.issue === issue.id) &&
      (channel === 'all' || (channel === 'saved' ? saved.has(article.dataset.key) : article.dataset.channel === channel)) &&
      (!query || article.textContent.toLocaleLowerCase().includes(query));
    article.hidden = !visible;
    if (visible) count++;
    article.querySelector('[data-save]').checked = saved.has(article.dataset.key);
  }
  const actualSaved = articles.filter(a => saved.has(a.dataset.key)).length;
  document.querySelector('#save-count').textContent = actualSaved;
  document.querySelector('#result-status').textContent = `${query ? '搜索全部期刊 · ' : channel === 'saved' ? '全部期刊收藏 · ' : ''}${count} 篇阅读`;
  document.querySelector('#empty').hidden = count > 0;
  document.querySelector('#empty-message').textContent = channel === 'saved' ? '还没有收藏。遇见值得重读的文章，就把它留下。' : '本期该栏目暂无匹配文章，试试其他栏目或关键词。';
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  view = b.dataset.view;
  if (view === 'week') { issueSelect.value = publication.issues[0].id; channel = 'all'; search.value = ''; }
  render();
}));
document.querySelectorAll('button[data-channel]').forEach(b => b.addEventListener('click', () => { channel = b.dataset.channel; if (view === 'sources') view = 'week'; render(); }));
issueSelect.addEventListener('change', () => { view = 'archive'; search.value = ''; render(); });
search.addEventListener('input', render);
document.querySelector('#search-form').addEventListener('submit', e => { e.preventDefault(); render(); });
document.querySelectorAll('[data-save]').forEach(input => input.addEventListener('change', () => {
  if (input.checked) saved.add(input.dataset.save); else saved.delete(input.dataset.save);
  try { localStorage.setItem('mathhot-saved', JSON.stringify([...saved])); } catch { document.querySelector('#result-status').textContent = '浏览器存储不可用，收藏仅在本次访问保留。'; }
  render();
}));
document.querySelector('#reset').addEventListener('click', () => { channel = 'all'; search.value = ''; render(); });
function openHash() {
  const key = location.hash.slice(1);
  const article = articles.find(a => a.id === key);
  if (!article) return;
  issueSelect.value = article.dataset.issue;
  channel = 'all'; view = 'archive'; search.value = '';
  render(); article.querySelector('details').open = true; article.scrollIntoView({block:'start'});
}
window.addEventListener('hashchange', openHash);
render(); openHash();
