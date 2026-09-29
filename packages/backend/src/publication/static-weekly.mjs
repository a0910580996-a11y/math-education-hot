import { readFile } from 'node:fs/promises';

const safeId = /^[a-z0-9][a-z0-9-]*$/;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const url = (value) => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };

export function validatePublication(channels, issues, sources) {
  if (!Array.isArray(channels) || !channels.length || !Array.isArray(issues) || !issues.length) throw new Error('栏目和周报不能为空');
  const ids = new Set();
  for (const channel of channels) {
    if (!safeId.test(channel.id) || ids.has(channel.id) || !text(channel.name) || !text(channel.shortName) || !Number.isInteger(channel.maxItems) || channel.maxItems < 1) throw new Error('栏目无效或重复');
    ids.add(channel.id);
  }
  const issueIds = new Set();
  for (const issue of issues) {
    if (!safeId.test(issue.id) || issueIds.has(issue.id) || !/^\d{4}-\d{2}-\d{2}$/.test(issue.date) || Number.isNaN(Date.parse(issue.date)) || !text(issue.label) || !text(issue.lead)) throw new Error('期号或日期无效');
    issueIds.add(issue.id);
    const reports = new Set();
    if (!Array.isArray(issue.reports)) throw new Error('缺少 reports');
    for (const report of issue.reports) {
      if (!safeId.test(report.id) || reports.has(report.id) || !ids.has(report.channel)) throw new Error('文章 ID 或栏目无效');
      reports.add(report.id);
      if (![report.title, report.dek, report.evidence, report.timeLabel].every(text) || !Array.isArray(report.paragraphs) || !report.paragraphs.length || !report.paragraphs.every(text)) throw new Error('文章正文不完整');
      if (!Array.isArray(report.sources) || !report.sources.length || !report.sources.every(s => text(s.title) && url(s.url) && /^\d{4}(-\d{2})?(-\d{2})?$/.test(s.published))) throw new Error('文章需要有效原始来源和日期');
    }
    for (const channel of channels) {
      if (issue.reports.filter(r => r.channel === channel.id).length > channel.maxItems) throw new Error('栏目超过每期条数上限');
    }
  }
  if (!Array.isArray(sources) || !sources.every(s => text(s.name) && url(s.url) && ids.has(s.channel) && text(s.evidence))) throw new Error('信源目录无效');
}

// All static outputs share the same validated publication snapshot.
export async function readStaticPublication(root) {
  const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
  const [channels, issues, sources] = await Promise.all([
    read('industry/weekly/channels.json'), read('content/weekly.json'), read('industry/weekly/sources.json')
  ]);
  validatePublication(channels, issues, sources);
  return { channels, issues: issues.sort((a, b) => b.date.localeCompare(a.date)), sources };
}
