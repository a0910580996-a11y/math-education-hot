# 数学教育 HOT

网站：https://a0910580996-a11y.github.io/math-education-hot/

这是 AIHOT 的静态周报发行版。保留 MIT 许可的上游代码，起点为 KKKKhazix/AIHOT 的 589f79eff09470b31ba8a7f1d9eb62d36ff2be6c。独立品牌，不使用上游 Logo。

## 当前运行边界

GitHub Pages 只托管 dist。Codex 本地定时任务执行检索、编辑和提交；GitHub Actions 校验后发布。不需要在网页中放 API Key，不需要为阅读部署数据库。原版 API、worker、PostgreSQL、聚簇模型和管理后台保留，但本次未部署；不要把保留代码说成正在运行的能力。首期采用人工式编辑与来源核验，未运行原版双模型评分。

行业规则在 industry/weekly/。content/weekly.json 是静态已出版内容的权威数据，content/reviews/ 记录来源核验。所有静态出口经过 packages/backend/src/publication/static-weekly.mjs 的同一读取和校验层；网页、RSS 与 weekly.json 数据一致。

## 本地构建

Node 24，无须安装依赖：

    node --test tests/static-publication.test.mjs
    node scripts/build-static.mjs

浏览器直接打开 dist/index.html 即可。GitHub Actions 在 main push 后构建并部署。上游完整服务端检查保留为手动 workflow，静态版本不依赖它。未运行上游数据库测试，不宣称完整服务端经过本次验收。

## 新增栏目

1. 在 industry/weekly/channels.json 添加唯一 id、name、shortName、description、prompt、maxItems 和可选 color。
2. 在 industry/weekly/prompts/ 添加编辑规则，在 sources.json 添加信源。
3. 在新一期 reports 中使用该 channel id；页面导航、过滤、RSS 自动纳入。历史期没有该栏目时展示空状态。

## 每周更新

执行 industry/weekly/editorial.md。学习科学每期一件事；AI 数学教育一至三件。时间以 Asia/Shanghai 为准。每周一 08:00 的 Codex 本地自动化需要本机和应用可执行；GitHub Pages 阅读不依赖本机在线。更新任务失败时保留上一期，不用空内容覆盖。

本次用户已授权静态托管及每周更新。后续仅对本项目已核实的周报内容提交并推送；不添加外部消息渠道。私人身份与项目资料不得进入公开仓库。

## 归宿与索引

权威源码与已刊内容：本项目 GitHub 仓库。Workstation 的 .work/进行中/math-education-hot 是当前本地工作检出，保留供每周更新任务使用，不是待清理的临时缓存。这里不存个人学习笔记的重复副本。

## 验证

静态校验测试覆盖栏目扩展、来源完整性、安全 URL、重复期号和每期条数。浏览器验证覆盖筛选、搜索、收藏持久化、文章深链、信源视图与手机排版。构建时 HTML/XML 转义，防止内容变成可执行标记。收藏仅浏览器本地存储，没有账户与分析追踪。
