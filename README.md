# Better Keypress

A better keypress library for native JavaScript with TypeScript support.

## Features

- 🎯 Modern JavaScript/TypeScript library
- 🚀 Zero dependencies
- 📦 Lightweight and fast
- 🔧 Flexible key combination handling
- 🛡️ Built-in input blocking for form elements
- 🌐 Framework agnostic (works with React, Vue, vanilla JS)
- ⚡ Support for async event handlers
- 🎹 Multiple key combination formats (`+` and `|` separators)
- 🔄 Easy subscription and unsubscription
- 🎯 Custom target element support

## Installation

```bash
npm install better-keypress
```

## Quick Start

```typescript
import { BetterKeyPress } from 'better-keypress';

// Create an instance
const keypress = new BetterKeyPress();

// Start listening for events
keypress.start();

// Listen for a simple key press
keypress.on('a', (event) => {
  console.log('Key "a" was pressed!');
});

// Listen for key combinations
keypress.on('control+s', (event) => {
  console.log('Save shortcut triggered!');
  event.preventDefault(); // Prevent browser save dialog
});
```

## API Reference

### Constructor

Create a new instance of BetterKeyPress:

```typescript
const keypress = new BetterKeyPress(options?);
```

**Options:**
```typescript
interface BetterKeyPressOptions {
  target?: EventTarget;              // Default: window
  defaultBlockElements?: string[];   // Default: ['input', 'textarea', 'select', 'option']
  defaultBlockAttributes?: string[]; // Default: ['contenteditable', 'block-keypress']
}
```

### Methods

#### `start()`

Start listening for keyboard events.

```typescript
keypress.start();
```

#### `stop()`

Stop listening and clean up all event listeners and registered handlers.

```typescript
keypress.stop();
```

#### `on(key, handler, options?)`

Register a key combination listener.

```typescript
keypress.on('ctrl+s', (event) => {
  console.log('Save triggered');
}, {
  preventDefault: true,
  stopPropagation: false,
  once: false
});
```

**Parameters:**
- `key`: String - Key combination (see Key Combination Formats below)
- `handler`: Function - Event handler `(event: KeyboardEvent) => void | Promise<void>`
- `options`: Object - Optional configuration

**Options:**
```typescript
interface KeyPressOptions {
  preventDefault?: boolean;  // Prevent default browser behavior (default: false)
  stopPropagation?: boolean; // Stop event bubbling (default: false)
  once?: boolean;           // Replace existing handlers instead of adding (default: false)
}
```

#### `off(key, handler)`

Remove a specific event handler.

```typescript
const handler = (e) => console.log('Handler');
keypress.on('a', handler);
keypress.off('a', handler); // Remove this specific handler
```

#### `offAll(key)`

Remove all handlers for a key combination.

```typescript
keypress.offAll('ctrl+s'); // Remove all handlers for Ctrl+S
```

#### `trigger(key, event)`

Manually trigger handlers for a key combination.

```typescript
const event = new KeyboardEvent('keydown', { key: 'a' });
keypress.trigger('a', event);
```

### Block Element Management

Control which elements should be blocked from triggering key events:

#### `addBlockElement(element)`

Add an element type to the block list.

```typescript
keypress.addBlockElement('button');
```

#### `removeBlockElement(element)`

Remove an element type from the block list.

```typescript
keypress.removeBlockElement('input');
```

#### `addBlockAttribute(attribute)`

Add an attribute to the block list.

```typescript
keypress.addBlockAttribute('data-no-keypress');
```

#### `removeBlockAttribute(attribute)`

Remove an attribute from the block list.

```typescript
keypress.removeBlockAttribute('contenteditable');
```

## Key Combination Formats

### Single Keys
```typescript
keypress.on('a', handler);           // Letter key
keypress.on('enter', handler);       // Special key
keypress.on('escape', handler);      // Escape key
keypress.on('space', handler);       // Space bar
```

### Modifier Combinations (using +)
```typescript
keypress.on('control+s', handler);         // Ctrl + S
keypress.on('control+shift+z', handler);   // Ctrl + Shift + Z  
keypress.on('alt+f4', handler);            // Alt + F4
keypress.on('meta+c', handler);            // Cmd/Win + C
```

### Alternative Combinations (using |)
```typescript
keypress.on('control+s|meta+s', handler);  // Ctrl+S OR Cmd+S (cross-platform save)
keypress.on('escape|control+c', handler);  // Escape OR Ctrl+C
```

### Supported Modifiers
- `control` / `ctrl` - Control key
- `alt` - Alt key  
- `shift` - Shift key
- `meta` - Command key (Mac) / Windows key (PC)

## Advanced Usage

### Async Event Handlers

The library supports async event handlers:

```typescript
keypress.on('ctrl+s', async (event) => {
  event.preventDefault();
  
  try {
    await saveDocument();
    console.log('Document saved successfully');
  } catch (error) {
    console.error('Save failed:', error);
  }
});
```

### Custom Target Element

Listen for events on a specific element instead of the window:

```typescript
const inputElement = document.getElementById('my-input');
const keypress = new BetterKeyPress({ 
  target: inputElement 
});

keypress.start();
keypress.on('enter', (event) => {
  console.log('Enter pressed in input');
});
```

### Cross-Platform Shortcuts

Handle platform differences elegantly:

```typescript
// Works on both Mac (Cmd) and PC (Ctrl)
keypress.on('control+s|meta+s', (event) => {
  event.preventDefault();
  saveDocument();
});

keypress.on('control+z|meta+z', (event) => {
  event.preventDefault();
  undo();
});
```

### Preventing Default Behavior

```typescript
// Prevent browser save dialog
keypress.on('ctrl+s', (event) => {
  // Handle save
}, { preventDefault: true });

// Stop event propagation
keypress.on('escape', (event) => {
  closeModal();
}, { stopPropagation: true });
```

### One-time Handlers

Use the `once` option to replace existing handlers instead of adding:

```typescript
// This will replace any existing 'a' handlers
keypress.on('a', handler1);
keypress.on('a', handler2, { once: true }); // Only handler2 will remain
```

## Framework Integration

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
      // Handle save
    });
    
    // Cleanup on unmount
    return () => {
      keypress.stop();
    };
  }, []);
  
  return <div>My App</div>;
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
        // Handle save
      });
    });
    
    onUnmounted(() => {
      keypress?.stop();
    });
  }
};
```

## Input Blocking

By default, key events are blocked when the user is typing in form elements. This prevents accidental triggering of shortcuts while filling out forms.

### Default Blocked Elements
- `input`
- `textarea` 
- `select`
- `option`

### Default Blocked Attributes  
- `contenteditable`
- `block-keypress`

### Customizing Blocked Elements

```typescript
const keypress = new BetterKeyPress({
  defaultBlockElements: ['input', 'textarea'], // Custom list
  defaultBlockAttributes: ['contenteditable'] // Custom attributes
});

// Or modify after creation
keypress.addBlockElement('button');
keypress.addBlockAttribute('data-no-shortcuts');
```

### Manual Blocking

Add the `block-keypress` attribute to any element to block key events:

```html
<div block-keypress>
  <!-- Key events won't trigger inside this div -->
</div>
```

## TypeScript Support

The library is written in TypeScript and provides full type definitions:

```typescript
import { BetterKeyPress, BetterKeyPressOptions, KeyPressEvent } from 'better-keypress';

const options: BetterKeyPressOptions = {
  target: document.body,
  defaultBlockElements: ['input']
};

const keypress = new BetterKeyPress(options);

// Handler with proper typing
keypress.on('ctrl+s', (event: KeyboardEvent) => {
  event.preventDefault();
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

```bash
# Development with watch mode
npm run dev

# Build the library  
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck
```

### Project Structure

```
better-keypress/
├── src/
│   ├── index.ts          # Main entry point
│   ├── core.ts           # Core BetterKeyPress class
│   └── util.ts           # Utility functions
├── tests/
│   ├── core.test.ts      # Unit tests
│   ├── util.test.ts      # Utility tests
│   └── setup.ts          # Test setup
├── dist/                 # Build output
└── ...config files
```

## License

MIT License - see LICENSE file for details.
