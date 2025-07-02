# Better Keypress

**中文** | [English](./README.md)

一个支持 TypeScript 的现代 JavaScript 按键监听库。

## 特性

- 🎯 现代 JavaScript/TypeScript 库
- 🚀 零依赖
- 📦 轻量且快速
- 🔧 灵活的按键组合处理
- 🛡️ 内置表单元素输入阻止功能
- 🌐 框架无关（支持 React、Vue、原生 JS）
- ⚡ 支持异步事件处理器
- 🎹 多种按键组合格式（`+` 和 `|` 分隔符）
- 🔄 简易的订阅和取消订阅
- 🎯 自定义目标元素支持

## 安装

```bash
npm install better-keypress
```

## 快速开始

```typescript
import { BetterKeyPress } from 'better-keypress';

// 创建实例
const keypress = new BetterKeyPress();

// 开始监听事件
keypress.start();

// 监听简单按键
keypress.on('a', (event) => {
  console.log('按键 "a" 被按下了！');
});

// 监听按键组合
keypress.on('control+s', (event) => {
  console.log('保存快捷键被触发！');
  event.preventDefault(); // 阻止浏览器保存对话框
});
```

## API 参考

### 构造函数

创建一个新的 BetterKeyPress 实例：

```typescript
const keypress = new BetterKeyPress(options?);
```

**选项：**
```typescript
interface BetterKeyPressOptions {
  target?: EventTarget;              // 默认：window
  defaultBlockElements?: string[];   // 默认：['input', 'textarea', 'select', 'option']
  defaultBlockAttributes?: string[]; // 默认：['contenteditable', 'block-keypress']
}
```

### 方法

#### `start()`

开始监听键盘事件。

```typescript
keypress.start();
```

#### `stop()`

停止监听并清理所有事件监听器和注册的处理器。

```typescript
keypress.stop();
```

#### `on(key, handler, options?)`

注册按键组合监听器。

```typescript
keypress.on('ctrl+s', (event) => {
  console.log('保存被触发');
}, {
  preventDefault: true,
  stopPropagation: false,
  once: false
});
```

**参数：**
- `key`: String - 按键组合（见下方按键组合格式）
- `handler`: Function - 事件处理器 `(event: KeyboardEvent) => void | Promise<void>`
- `options`: Object - 可选配置

**选项：**
```typescript
interface KeyPressOptions {
  preventDefault?: boolean;  // 阻止默认浏览器行为（默认：false）
  stopPropagation?: boolean; // 停止事件冒泡（默认：false）
  once?: boolean;           // 替换现有处理器而不是添加（默认：false）
}
```

#### `off(key, handler)`

移除特定的事件处理器。

```typescript
const handler = (e) => console.log('处理器');
keypress.on('a', handler);
keypress.off('a', handler); // 移除这个特定的处理器
```

#### `offAll(key)`

移除按键组合的所有处理器。

```typescript
keypress.offAll('ctrl+s'); // 移除 Ctrl+S 的所有处理器
```

#### `trigger(key, event)`

手动触发按键组合的处理器。

```typescript
const event = new KeyboardEvent('keydown', { key: 'a' });
keypress.trigger('a', event);
```

### 元素阻止管理

控制哪些元素应该被阻止触发按键事件：

#### `addBlockElement(element)`

添加元素类型到阻止列表。

```typescript
keypress.addBlockElement('button');
```

#### `removeBlockElement(element)`

从阻止列表中移除元素类型。

```typescript
keypress.removeBlockElement('input');
```

#### `addBlockAttribute(attribute)`

添加属性到阻止列表。

```typescript
keypress.addBlockAttribute('data-no-keypress');
```

#### `removeBlockAttribute(attribute)`

从阻止列表中移除属性。

```typescript
keypress.removeBlockAttribute('contenteditable');
```

## 按键组合格式

### 单个按键
```typescript
keypress.on('a', handler);           // 字母键
keypress.on('enter', handler);       // 特殊键
keypress.on('escape', handler);      // ESC 键
keypress.on('space', handler);       // 空格键
```

### 修饰键组合（使用 +）
```typescript
keypress.on('control+s', handler);         // Ctrl + S
keypress.on('control+shift+z', handler);   // Ctrl + Shift + Z  
keypress.on('alt+f4', handler);            // Alt + F4
keypress.on('meta+c', handler);            // Cmd/Win + C
```

### 备选组合（使用 |）
```typescript
keypress.on('control+s|meta+s', handler);  // Ctrl+S 或者 Cmd+S（跨平台保存）
keypress.on('escape|control+c', handler);  // Escape 或者 Ctrl+C
```

### 支持的修饰键
- `control` / `ctrl` - Control 键
- `alt` - Alt 键  
- `shift` - Shift 键
- `meta` - Command 键（Mac）/ Windows 键（PC）

## 高级用法

### 异步事件处理器

库支持异步事件处理器：

```typescript
keypress.on('ctrl+s', async (event) => {
  event.preventDefault();
  
  try {
    await saveDocument();
    console.log('文档保存成功');
  } catch (error) {
    console.error('保存失败：', error);
  }
});
```

### 自定义目标元素

在特定元素上监听事件而不是在 window 上：

```typescript
const inputElement = document.getElementById('my-input');
const keypress = new BetterKeyPress({ 
  target: inputElement 
});

keypress.start();
keypress.on('enter', (event) => {
  console.log('在输入框中按下了回车');
});
```

### 跨平台快捷键

优雅地处理平台差异：

```typescript
// 在 Mac（Cmd）和 PC（Ctrl）上都能工作
keypress.on('control+s|meta+s', (event) => {
  event.preventDefault();
  saveDocument();
});

keypress.on('control+z|meta+z', (event) => {
  event.preventDefault();
  undo();
});
```

### 阻止默认行为

```typescript
// 阻止浏览器保存对话框
keypress.on('ctrl+s', (event) => {
  // 处理保存
}, { preventDefault: true });

// 停止事件传播
keypress.on('escape', (event) => {
  closeModal();
}, { stopPropagation: true });
```

### 一次性处理器

使用 `once` 选项来替换现有处理器而不是添加：

```typescript
// 这将替换任何现有的 'a' 处理器
keypress.on('a', handler1);
keypress.on('a', handler2, { once: true }); // 只有 handler2 会保留
```

## 框架集成

### React

```typescript
import React, { useEffect } from 'react';
import { BetterKeyPress } from 'better-keypress';

function App() {
  useEffect(() => {
    const keypress = new BetterKeyPress();
    keypress.start();
    
    keypress.on('ctrl+s', (event) => {
      event.preventDefault();
      // 处理保存
    });
    
    // 组件卸载时清理
    return () => {
      keypress.stop();
    };
  }, []);
  
  return <div>我的应用</div>;
}
```

### Vue

```typescript
import { onMounted, onUnmounted } from 'vue';
import { BetterKeyPress } from 'better-keypress';

export default {
  setup() {
    let keypress: BetterKeyPress;
    
    onMounted(() => {
      keypress = new BetterKeyPress();
      keypress.start();
      
      keypress.on('ctrl+s', (event) => {
        event.preventDefault();
        // 处理保存
      });
    });
    
    onUnmounted(() => {
      keypress?.stop();
    });
  }
};
```

## 输入阻止

默认情况下，当用户在表单元素中输入时，按键事件会被阻止。这可以防止在填写表单时意外触发快捷键。

### 默认被阻止的元素
- `input`
- `textarea` 
- `select`
- `option`

### 默认被阻止的属性  
- `contenteditable`
- `block-keypress`

### 自定义被阻止的元素

```typescript
const keypress = new BetterKeyPress({
  defaultBlockElements: ['input', 'textarea'], // 自定义列表
  defaultBlockAttributes: ['contenteditable'] // 自定义属性
});

// 或者在创建后修改
keypress.addBlockElement('button');
keypress.addBlockAttribute('data-no-shortcuts');
```

### 手动阻止

给任何元素添加 `block-keypress` 属性来阻止按键事件：

```html
<div block-keypress>
  <!-- 在这个 div 内部不会触发按键事件 -->
</div>
```

## TypeScript 支持

该库使用 TypeScript 编写并提供完整的类型定义：

```typescript
import { BetterKeyPress, BetterKeyPressOptions, KeyPressEvent } from 'better-keypress';

const options: BetterKeyPressOptions = {
  target: document.body,
  defaultBlockElements: ['input']
};

const keypress = new BetterKeyPress(options);

// 具有正确类型的处理器
keypress.on('ctrl+s', (event: KeyboardEvent) => {
  event.preventDefault();
});
```

## 浏览器支持

- Chrome（最新版）
- Firefox（最新版）  
- Safari（最新版）
- Edge（最新版）

## 开发

### 可用脚本

```bash
# 开发模式（监听模式）
npm run dev

# 构建库
npm run build

# 运行测试
npm test
npm run test:watch
npm run test:coverage

# 运行端到端测试
npm run test:e2e
npm run test:e2e:ui

# 代码检查
npm run lint
npm run lint:fix

# 类型检查
npm run typecheck
```

### 项目结构

```
better-keypress/
├── src/
│   ├── index.ts          # 主入口点
│   ├── core.ts           # 核心 BetterKeyPress 类
│   └── util.ts           # 工具函数
├── tests/
│   ├── core.test.ts      # 单元测试
│   ├── util.test.ts      # 工具测试
│   └── setup.ts          # 测试设置
├── dist/                 # 构建输出
└── ...配置文件
```

## 许可证

MIT 许可证 - 详情请参见 LICENSE 文件。