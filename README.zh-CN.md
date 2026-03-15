# AgentsMem

**AI 智能体记忆加密备份。** 提供 Web 应用与 API：上传、列表、下载加密备份；在控制台管理智能体与账户。

[English](README.md) · [中文](README.zh-CN.md)

---

## 什么是 AgentsMem？

AgentsMem 让 AI 智能体以加密形式备份记忆。加密在智能体端完成，只上传密文。AgentsMem 及任何第三方都无法读取你的记忆内容，只有你（以及持有本地密钥的智能体）可以解密。

- **智能体端加密** — 密钥只在你本地，我们从不接触明文。
- **备份 API** — 通过 API key 上传、列表、下载加密数据。
- **Web 控制台** — 认领智能体、管理备份、查看历史（可选；智能体也可直接用 API）。

## 仓库结构

| 路径 | 说明 |
|------|------|
| `src/` | Next.js 前端（页面、组件、i18n） |
| `agentsmem/` | 后端 API（Express、TypeScript、MySQL） |
| `docs/development/` | [开发指南](docs/development/README.md)（环境、测试、工作流） |
| `tests/unit/` | 前端 Jest 单元测试 |
| `public/` | 静态资源与公开文档 |

## 快速开始

### 1. 环境

```bash
cp agentsmem/.env.example agentsmem/.env
# 在 agentsmem/.env 中设置 DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

### 2. 数据库

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS agentsmem;"
cd agentsmem && npm run db:migrate && cd ..
```

### 3. 运行

- **后端：** `cd agentsmem && npm install && npm run dev` → API 在 http://localhost:3011  
- **前端：** `npm install && npm run dev` → 应用在 http://localhost:3010  

设置 `AGENTSMEM_API_URL=http://localhost:3011`（如在 `.env.local`）以便 Next 调用 API。

## 脚本

**根目录（前端）：**

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Next.js 开发服务器 |
| `npm run build` | 构建 Next.js 生产版本 |
| `npm run lint` | 运行 ESLint |
| `npm run type-check` | 运行 `tsc --noEmit` |
| `npm run test` | 运行所有 Jest 测试 |
| `npm run test:unit` | 仅运行 `tests/unit/` 中的测试 |
| `npm run test:watch` | Jest 监听模式 |
| `npm run test:coverage` | 带覆盖率报告的 Jest |

**后端**（在 `agentsmem/` 下）：`npm run dev`、`npm run build`、`npm run start`、`npm run db:migrate`。

## 文档

- [开发工作流与测试](docs/development/README.md)
- [后端 API 与配置](agentsmem/)（见 `agentsmem/` 源码与 `.env.example`）

## 技术栈

- **前端：** Next.js 14、React 18、TypeScript、Tailwind CSS  
- **后端：** Node.js、Express、TypeScript、MySQL  
- **认证：** 智能体 API Key；控制台为 Cookie 会话（JWT）

## 安全与隐私

备份在上传前已加密，我们只存储密文与元数据。站内 [安全说明](https://agentsmem.com/security)（本地运行时为 `/security`）简要说明了记忆为何仅你可读。

## 许可证

见 [LICENSE](LICENSE)（或仓库所标许可证）。

## 仓库

**[https://github.com/ocmuuu/agentsmem](https://github.com/ocmuuu/agentsmem)**
