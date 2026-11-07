# MathViz · 让数学看得见

> 用交互式可视化理解数学。—— [github.com/zc-xzc/MathViz](https://github.com/zc-xzc/MathViz)

---

## 在线访问

**在线入口**：[https://zc-xzc.github.io/MathViz/](https://zc-xzc.github.io/MathViz/)

首次发布需要在仓库设置中启用 GitHub Pages，步骤见下方「部署」。如果入口返回 404，可先按「本地运行」查看页面。

---

## 理念

数学不应该是"背公式"的学科。MathViz 的目标是用 3D 和 2D 交互可视化，把抽象概念变成可观察、可操作的空间结构。

- **从图像到直觉** — 每个核心概念都配以可交互的视觉演示
- **从直觉到严谨** — 可视化 + 代数推导，两个角度互相印证
- **从知识到体系** — 线代、高数、概率不再是孤立的科目

## ✅ 当前内容

| 科目 | 模块 | 类型 | 说明 |
|------|------|------|------|
| 线性代数 | [非齐次通解 = 特解 + 齐次通解 · 3D 求解器](线性代数/非齐次解三维演示/index.html) | 3D 交互 | 支持任意 3×3 矩阵输入，动态求解并重建场景 |

## 📂 目录结构

```
MathViz/
├── index.html                 # 首页
├── 线性代数/
│   ├── index.html             # 线性代数科目页
│   └── 非齐次解三维演示/
│       └── index.html         # 3D 方程组求解器（核心交互）
├── 高等数学/
│   └── index.html             # 高等数学科目页（筹备中）
├── exam/
│   └── index.html             # 考研专区（内容规划与模块入口）
├── tests/check.cjs             # 链接、语法、求解器与输入校验回归检查
└── .nojekyll                   # 按静态文件直接发布，不经 Jekyll 处理
```

## 🗺 规划中

- **线性代数**: 特征值与特征向量可视化、二次型与正定性可视化
- **高等数学**: 极限 ε-δ 语言图解、定积分黎曼和演示、泰勒展开可视化
- **考研专区**: 公式速查表、真题分类索引、高频考点可视化索引

## 本地运行

项目是纯静态 HTML/CSS/JavaScript，无需 npm 安装或构建。在仓库根目录启动一个本地 HTTP 服务：

```bash
python3 -m http.server 8000
```

打开 [http://localhost:8000/](http://localhost:8000/)。3D 求解器需要支持 WebGL 的现代浏览器；Three.js、OrbitControls 和 MathJax 从 CDN 加载，因此首次打开需要联网。

## 本地检查

安装 Node.js 后，在仓库根目录运行（无需 npm 依赖）：

```bash
node tests/check.cjs
```

检查所有 HTML 页面的本地链接与锚点、内联 JavaScript 语法、不同秩与相容性的方程组，以及输入校验。交互场景仍需在浏览器中检查。

## 🚀 部署

使用 [GitHub Pages](https://pages.github.com/) 发布仓库根目录，`index.html` 为入口，`.nojekyll` 保留原始静态文件结构。

1. 打开仓库 [Settings → Pages](https://github.com/zc-xzc/MathViz/settings/pages)。
2. 在 **Build and deployment → Source** 中选择 **Deploy from a branch**。
3. 将 **Branch** 设为 `main`，目录设为 `/(root)`，点击 **Save**。
4. 等待 GitHub 的 Pages 部署完成，再访问 [MathViz](https://zc-xzc.github.io/MathViz/)。

首页与模块使用相对路径，同时支持本地根目录和 GitHub Pages 的 `/MathViz/` 子目录。更新后若仍有问题，请检查：

- 整站 404：确认 Pages 已启用、发布分支及目录正确，并查看仓库 Actions 中的 Pages 部署结果。
- 页面可开但 3D 区域空白：检查浏览器 WebGL 支持与 CDN 网络连接。
- 直接访问模块：保留目录名的大小写与完整路径，不要删掉 `/MathViz/` 前缀。

## 📄 许可

本仓库采用 [MIT License](LICENSE)。可视化用于辅助学习，数值计算与几何图示仍需结合数学推导核对。
