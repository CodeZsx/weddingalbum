# 张守祥 & 张悦婷 · 婚纱相册

三个相册：**精修**、**初修**、**产品**。纯静态，可部署到 GitHub Pages。

## 为什么上次会卡住

上一轮曾对 300 多张原片做长边压缩。初修大约 3GB、精修大约 476MB，压缩会跑很久，命令超时后又被重试，所以看起来一直卡着。

这次**不会自动压图**。站点直接读 `public/albums` 里的文件。若以后要上 GitHub Pages，仓库建议不超过 1GB，请自己择机执行：

```bash
npm run optimize
```

`初修` 里误放的 `A71I4822.zip`（约 239MB）已删除，它不能当照片展示。

## 本地预览

```bash
npm install
npm run dev
```

`dev` / `build` 会先扫描相册文件名和尺寸，再启动，不会改原图。

## 管理员

打开 `#/admin`，默认口令 `xt1003`（可在 `src/data.ts` 的 `adminPassword` 修改）。

- 可以整本相册、单张照片上线 / 下线
- 访客只看上线的内容
- 在管理页填一次 GitHub Token（权限勾选 `repo`），之后点选会自动保存
- 访客刷新即可看到，不用重新发布整个网站

Token 在 GitHub：**Settings → Developer settings → Personal access tokens** 新建，勾选 `repo`。只存在你这台电脑的浏览器里。

## 沉浸式

相册页右下角浮动按钮，或直接点一张照片：只留图片，左右滑动 / 点两侧 / 方向键翻页，底部是前后照片预览条。

## 部署

1. 把仓库推到 GitHub
2. **Settings → Pages → Source** 选 **GitHub Actions**
3. 地址一般是 `https://<用户名>.github.io/<仓库名>/`

照片很大时，先 `npm run optimize` 再推，否则仓库体积和打开速度都会很难看。
