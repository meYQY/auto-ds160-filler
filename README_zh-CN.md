<div align="center">
  <h1 align="center">Auto DS-160 Filler</h1>
  <p align="center">
    <strong>秒填美签 DS-160 表格，告别重复劳动。</strong>
  </p>
  <p align="center">
    由 GPT-5.1 驱动 · 本地优先 · 隐私安全
  </p>
</div>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![GPT-5.1](https://img.shields.io/badge/AI-GPT--5.1-10A37F?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

</div>

<br/>

<p align="center">
  <a href="./README.md">English Documentation</a>
</p>

<br/>

## 简介

**Auto DS-160 Filler** 是一个开源 Chrome 扩展，旨在解决美国签证申请（DS-160）过程中最痛苦的填表环节。

美签官网（CEAC）系统古老、经常超时、填写繁琐。我们利用最新的 **GPT-5.1** 模型，让你只需用自然语言（中文或英文）描述个人情况，即可自动转换为符合官方要求的格式，并一键填充。

> **隐私声明**: 本项目没有后端服务器。你的所有数据和 API Key 都只存储在本地浏览器中，直接与 OpenAI 接口通信。

## 核心特性

- 🪄 **自然语言交互**
  直接扔一段简历或自我介绍进去，AI 自动提取关键信息。

- ⚡️ **GPT-5.1 加持**
  利用 GPT-5.1 强大的多模态和推理能力，精准处理地址翻译、日期转换等逻辑。

- 🛡️ **本地化 & 隐私**
  无数据库，无追踪。拒绝将敏感的签证数据上传到第三方服务器。

- 🎯 **严格的类型校验**
  基于 TypeScript 构建，严格遵循 DS-160 官方表单逻辑，减少被拒风险。

- 🔌 **一键自动填充**
  通过 Content Script 注入，自动完成网页上的表单填写。

## 关于我们

我们是一群对签证系统深感头痛的开发者和签证顾问。

本项目衍生自企业级签证处理系统 **PipelineVisa**。我们意识到“自动填表”这一核心技术对于个人申请者来说极具价值，因此决定将其剥离并开源。

虽然这是一个免费的开源工具，但我们沿用了商业级的代码标准和隐私保护原则，旨在帮助每一个申请者节省时间，减少因手误导致的拒签风险。

## 快速开始

目前处于 **开发者预览版 (Developer Preview)** 阶段。

### 环境要求

- Node.js 18+
- OpenAI API Key (需支持 GPT-5.1)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/auto-ds160-filler.git
   cd auto-ds160-filler
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建插件**
   ```bash
   npm run build
   ```

4. **在 Chrome 中加载**
   - 浏览器访问 `chrome://extensions/`
   - 开启右上角的 **开发者模式**
   - 点击 **加载已解压的扩展程序**
   - 选择本项目下的 `dist` 文件夹

## 技术栈

- **框架**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [OpenAI API](https://platform.openai.com/docs/models) (GPT-5.1)

## 路线图 (Roadmap)

- [x] 个人信息板块 (Personal Information)
- [x] 护照信息板块 (Passport Information)
- [x] 旅行计划与同行人 (Travel History)
- [x] 教育与工作经历 (Education & Work)
- [x] 家庭信息 (父母与配偶)
- [x] 地址与联系方式
- [x] 安全背景调查 (基础支持)
- [ ] 照片合规性 AI 检查
- [ ] 导出 PDF 备份

## 参与贡献

非常欢迎社区贡献！
目前项目只是从大型系统中抽离出的核心功能，还有很多字段映射需要完善。
详情请见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开源协议

基于 MIT License 分发。详见 `LICENSE` 文件。
