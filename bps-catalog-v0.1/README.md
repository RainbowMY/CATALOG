# BESTFULFILL Catalog Prototype v0.1

可交互原型：BPS 客户端 Products → Catalog 重构示意（面向商家的选品前台体验）。

## 本地启动

```bash
cd bps-catalog-v0.1
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

## 单文件分享包

```bash
npm run build:share
```

产物路径：`share/bps-catalog-v0.1.html`  

建议下载后用浏览器直接打开。在线预览平台未必能完整跑交互。本包使用 HashRouter，`file://` 也可打开。

## 本期页面

1. Catalog 首页 — Banner、三级分类、5 个资源位（每行 5 商品、悬停放大）
2. All Products — 国家/分类/价格/库存筛选、排序、Grid/List、每页 50
3. Collection — Banner / 资源位落地集合页
4. Product Detail — 规格、币种、运费假数据（无 Add to Store）

## 技术说明

- React + Vite + Tailwind CSS（自定义前台视觉，非中后台组件库）
- 假数据：120 个商品，SVG 简洁商品图
- 壳层 BESTFULFILL 仅示意
