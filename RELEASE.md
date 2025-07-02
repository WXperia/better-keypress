# Release Guide

本项目使用 GitHub Actions 自动化版本发布流程。

## 发布方式

### 方式1：手动触发（推荐）

1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Release and Publish" 工作流
3. 点击 "Run workflow"
4. 选择版本类型：
   - `patch`: 修复版本 (1.0.0 → 1.0.1)
   - `minor`: 功能版本 (1.0.0 → 1.1.0)  
   - `major`: 重大版本 (1.0.0 → 2.0.0)
5. 点击运行

### 方式2：推送标签

```bash
git tag v1.0.1
git push origin v1.0.1
```

## 发布流程

工作流会自动执行以下步骤：

1. **代码检查**
   - 运行测试套件
   - TypeScript 类型检查
   - ESLint 代码检查

2. **构建**
   - 生成 CommonJS 版本
   - 生成 ES Module 版本
   - 生成 TypeScript 定义文件

3. **版本管理**
   - 更新 package.json 版本号
   - 创建 git 标签（仅手动触发时）

4. **发布**
   - 发布到 npm registry
   - 创建 GitHub Release
   - 上传构建产物

## 环境变量配置

需要在 GitHub Secrets 中配置：

- `NPM_TOKEN`: npm 发布令牌

## 版本规范

遵循语义化版本规范：
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增  
- **PATCH**: 向后兼容的问题修复