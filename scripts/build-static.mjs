import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { readStaticPublication } from '../packages/backend/src/publication/static-weekly.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
const data = await readStaticPublication(root);
const base = 'https://a0910580996-a11y.github.io/math-education-hot/';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const article = (issue, report) => {
  const channel = data.channels.find(c => c.id === report.channel);
  const key = `${issue.id}-${report.id}`;
  return `<article id="${key}" data-channel="${report.channel}" data-issue="${issue.id}" data-key="${key}">
    <div class="article-meta"><span class="category ${channel.color === 'red' ? 'red' : ''}">${escape(channel.name)}</span><span>${escape(report.timeLabel)}</span></div>
    <div class="article-intro"><div><h2><a href="#${key}">${escape(report.title)}</a></h2><p class="dek">${escape(report.dek)}</p><div class="evidence">${escape(report.evidence)}</div></div>${report.id === 'retrieval-practice' ? '<img class="article-art" src="assets/learning.png" alt="带高线的三角形数学示意插图" width="360" height="240">' : ''}</div>
    <details><summary>阅读全文 <span>${Math.max(1, Math.ceil(report.paragraphs.join('').length / 350))} 分钟</span></summary><div class="prose">${report.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}</div></details>
    <div class="article-bottom"><label class="save"><input type="checkbox" data-save="${key}"> 收藏</label><span>${escape(issue.date)} · ${escape(issue.label)}</span></div>
    <div class="citations"><span>原始来源</span>${report.sources.map(s => `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} <small>${escape(s.published)}</small></a>`).join('')}</div>
  </article>`;
};
const template = await readFile(new URL('apps/static/index.html', root), 'utf8');
const scriptData = JSON.stringify(data).replace(/</g, '\\u003c');
const html = template.replace('<!--CHANNELS-->', data.channels.map(c => `<button data-channel="${c.id}" aria-pressed="false">${escape(c.name)}</button>`).join(''))
  .replace('<!--ISSUES-->', data.issues.map(i => `<option value="${i.id}">${i.date} · ${escape(i.label)}</option>`).join(''))
  .replace('<!--ARTICLES-->', data.issues.map(i => i.reports.map(r => article(i, r)).join('')).join(''))
  .replace('<!--SOURCES-->', data.sources.map(s => `<li><a target="_blank" rel="noopener noreferrer" href="${escape(s.url)}">${escape(s.name)}</a><p>${escape(s.evidence)}</p></li>`).join(''))
  .replace('<!--DATA-->', `<script id="publication" type="application/json">${scriptData}</script>`);
await mkdir(out, { recursive: true });
await cp(new URL('apps/static/', root), out, { recursive: true });
await writeFile(new URL('index.html', out), html);
await writeFile(new URL('weekly.json', out), JSON.stringify(data, null, 2));
await writeFile(new URL('.nojekyll', out), '');
const rss = data.issues.flatMap(i => i.reports.map(r => `<item><title>${escape(r.title)}</title><link>${base}#${i.id}-${r.id}</link><guid isPermaLink="true">${base}#${i.id}-${r.id}</guid><pubDate>${new Date(i.date + 'T00:00:00+08:00').toUTCString()}</pubDate><description>${escape(r.dek + '\n\n' + r.paragraphs.join('\n\n') + '\n\n' + r.sources.map(s => s.title + ': ' + s.url).join('\n'))}</description></item>`)).join('');
await writeFile(new URL('feed.xml', out), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>数学教育 HOT</title><link>${base}</link><description>认知科学、学习科学与 AI 数学教育周报</description><language>zh-cn</language>${rss}</channel></rss>`);
await writeFile(new URL('llms.txt', out), `# 数学教育 HOT\n\n每周数学教育阅读。\n- [结构化周报](${base}weekly.json)\n- [RSS](${base}feed.xml)\n- [上游框架](https://github.com/KKKKhazix/AIHOT)\n\n静态站不提供原版后台、MCP 或实时 API。\n`);
console.log(`Published ${data.issues.length} issues / ${data.channels.length} channels to dist`);
