# CET-6 六级刷词宝典

手机优先的离线词汇练习 PWA。顺序刷词、100 词随机考试、错题练习、学习统计均无需账号或后端。答题记录只保存在当前设备的 IndexedDB 中。

## 当前词库说明

`src/data/cet6_words.json` 收录 **5,357 条词目**：覆盖 [CETVocabulary](https://github.com/exam-data/CETVocabulary) 按《全国大学英语四、六级考试大纲（2016 年修订版）》整理的全部 5,278 条词目（其中 1,253 条标记为六级），另保留原有 115 条示例词中不在该词表的 79 条。词目按“原有词汇 → 六级标记词 → 其余大纲词汇”排列，原有词汇的 `id` 和位置均未改变，因此旧学习记录仍对应原来的词。词库属于第三方整理数据，并非考试主管机构发布的官方应用。

中文释义取自 CETVocabulary；新增词目的音标和部分词性取自 [ECDICT](https://github.com/skywind3000/ECDICT)。目前 5,200 条有音标、4,642 条有词性；没有可靠数据的字段留空。新增词目暂没有经校对的例句，界面会自动隐藏空例句。界面中的词库总数始终来自 JSON 的实际条数。

词库文件是 JSON 数组。每条记录包含：`id`（唯一整数）、`word`、`phonetic`、`meaning`、`partOfSpeech`、`example`、`exampleTranslation`。扩充词库时不要改变已有词目的 `id`，否则旧学习记录会指向新单词。重新构建、发布后，PWA 会更新缓存。

数据来源和许可：CETVocabulary 的词表采用 [CC BY-NC-SA 4.0](third_party_licenses/CETVocabulary-LICENSE.txt)，ECDICT 采用 [MIT](third_party_licenses/ECDICT-LICENSE.txt)。本项目对前者的筛选、合并和字段转换数据按 CC BY-NC-SA 4.0 共享，仅供非商业使用；音标和词性补充保留 ECDICT 的 MIT 许可声明。导入时使用的上游版本分别是 [CETVocabulary `7f21d0d`](https://github.com/exam-data/CETVocabulary/tree/7f21d0d9ad93c16a17849a24ccc4046e0f64c4af) 和 [ECDICT `82c9872`](https://github.com/skywind3000/ECDICT/tree/82c9872576b23118d7c42e920c11beb77f510ae2)。转换脚本在 `scripts/import-vocabulary.mjs`，下载上游 `cet_full_list.json` 为 `cet_source.json`、`ecdict.csv` 为 `ecdict_source.csv` 后可重新运行。两份原始大文件不随项目发布。

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

