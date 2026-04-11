# rpa_jiedan

RPA 自动化服务静态落地页项目，使用原生 HTML/CSS/JavaScript 构建，通过 Nginx 容器部署。

## 项目结构

```text
.
├── index.html              # 页面结构（包含首屏主题初始化脚本）
├── src/
│   ├── top.html            # 文档头与 body 起始
│   ├── bottom.html         # 文档结尾与脚本引入
│   └── sections/           # 语义化页面区块
│       ├── overlays.html
│       ├── nav.html
│       ├── hero.html
│       ├── stats.html
│       ├── scenarios.html
│       ├── process.html
│       ├── tools.html
│       ├── cta.html
│       └── footer.html
├── assets/
│   ├── styles.css          # 页面样式
│   └── app.js              # 页面交互逻辑
├── scripts/
│   └── build-index.sh      # 从 src 分片拼装 index.html
├── deploy/
│   └── nginx.conf          # Nginx 站点配置
├── Dockerfile
└── docker-compose.yml
```

## 本地运行（Docker）

```bash
docker compose up --build -d
```

访问：`http://localhost`

如果 80 端口被占用，把 `docker-compose.yml` 中端口映射改成 `8080:80`，然后访问 `http://localhost:8080`。

## 修改指南

- 文案和区块结构：优先编辑 `src/sections/*.html`
- 样式：编辑 `assets/styles.css`
- 交互（主题、复制邮箱、弹窗、动画等）：编辑 `assets/app.js`
- 每次修改分片后执行构建：

```bash
bash scripts/build-index.sh
```

- 生成后的 `index.html` 为部署入口文件（Nginx 直接读取）

## 部署说明

- 镜像基于 `nginx:1.27-alpine`
- 容器启动后，静态资源位于 `/usr/share/nginx/html`
- Nginx 路由配置在 `deploy/nginx.conf`
