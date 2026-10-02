# CET-6 六级刷词宝典

手机优先的离线词汇练习 PWA。顺序刷词、100 词随机考试、错题练习、学习统计均无需账号或后端。答题记录只保存在当前设备的 IndexedDB 中。

## 当前词库说明

`src/data/cet6_words.json` 目前收录 **115 条示例词**，供完整功能运行和验证。它**不是官方完整六级词表**。部分示例词尚未校对音标，`phonetic` 留空；例句是基础示例，正式长期使用前建议换成经过校对、授权的完整词库。界面中的词库总数来自 JSON 的实际条数，不会显示虚构的 5000+ 数量。

词库文件是 JSON 数组。每条记录包含：`id`（唯一整数）、`word`、`phonetic`、`meaning`、`partOfSpeech`、`example`、`exampleTranslation`。替换时保持这些字段、唯一 `id`，并至少保留 4 种不同释义；100 词考试需要至少 100 个不同单词。不要随意改变已使用单词的 `id`，否则旧学习记录会指向新单词。替换文件后重新构建、发布，PWA 会更新缓存。请自行确认新词库的版权或授权。

## 功能

- 顺序四选一，选完立即判题，可上一题、下一题、重做。
- 错题本按累计错误次数排序；答对一次不会自动移出，手动移出不删除历史次数。
- 每场考试随机抽取 100 个不重复单词，选项顺序随机；未完成考试可在同一设备刷新后继续。
- 完成考试后保存分数与所有题目的选择，统计页显示考试历史。
- 本地 IndexedDB 保存学习数据；首次加载后，PWA 缓存页面、脚本、样式、图标和内置词库供离线使用。

## 技术栈与目录

React、TypeScript、Vite、React Router（HashRouter）、原生 IndexedDB、vite-plugin-pwa。

```text
src/
  components/  通用卡片、导航、题目和选项
  data/        cet6_words.json 及读取校验
  db/          IndexedDB 事务与数据操作
  pages/       首页、练习、考试、错题、统计、设置
  state/       页面共享数据
  types/       TypeScript 数据类型
  utils/       随机抽题与选项生成
  styles.css   手机端样式
public/       应用图标
.github/workflows/deploy.yml  自动部署
```

## 本地运行

需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

本地开发服务的离线能力与正式构建不同；验证离线访问请使用构建后的预览或 GitHub Pages 地址，并先联网打开一次。

## GitHub Pages 部署

1. 将本项目根目录的内容推送到 GitHub 仓库的 `main` 分支。
2. 仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。
3. `deploy.yml` 在推送到 `main` 时运行 `npm ci`、`npm run build`，并发布 `dist`。
4. 工作流自动设置 `VITE_BASE=/<仓库名>/`。如果使用自定义域名或需要不同路径，可在工作流 `VITE_BASE` 处修改，例如根路径 `/`。本地默认是 `/`。
5. 页面地址通常是 `https://用户名.github.io/仓库名/`。页面路由使用 `/#/study` 等 HashRouter 地址，刷新不会向 Pages 请求子路径。

## 手机使用

1. 在 Safari 或 Chrome 中打开 GitHub Pages 地址。
2. 等页面首次加载完成。
3. 在浏览器菜单中选择“添加到主屏幕”。
4. 从手机桌面启动。

## 本地数据和清空

IndexedDB 数据库名为 `CET6TrainerDB`，包含 `wordProgress`（每词答题次数、最近结果、选项）、`wrongBook`（错题索引）、`examHistory`（历史成绩和答题详情）、`appState`（顺序学习位置）、`examSession`（未完成考试）。记录只属于当前浏览器和当前网站地址；更换设备或清理网站数据不会自动同步。

应用内进入“设置 → 重置所有学习记录”，经二次确认后清空这些存储，不会删除内置词库。请注意此操作不可恢复。

