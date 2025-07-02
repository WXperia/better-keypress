import { BetterKeyPress, BetterKeyPressOptions, KeyPressEvent } from '../src/core';

// Global test utilities
declare global {
  var createKeyboardEvent: (type: string, options?: KeyboardEventInit) => KeyboardEvent;
  var createMockElement: (tagName: string, attributes?: Record<string, string>) => HTMLElement;
}

describe('BetterKeyPress', () => {
  let betterKeyPress: BetterKeyPress;
  let mockTarget: EventTarget;

  beforeEach(() => {
    // Create a mock target with addEventListener and removeEventListener
    mockTarget = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    
    betterKeyPress = new BetterKeyPress({ target: mockTarget });
    
    // Reset document body
    document.body.innerHTML = '';
    
    // Reset getSelection mock
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 0,
      getRangeAt: jest.fn(),
    });
  });

  afterEach(() => {
    betterKeyPress.stop();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const instance = new BetterKeyPress();
      expect(instance.target).toBe(window);
      expect(instance.defaultBlockElements).toEqual(['input', 'textarea', 'select', 'option']);
      expect(instance.defaultBlockAttributes).toEqual(['contenteditable', 'block-keypress']);
    });

    it('should initialize with custom options', () => {
      const customTarget = document.createElement('div');
      const customOptions: BetterKeyPressOptions = {
        target: customTarget,
        defaultBlockElements: ['input', 'textarea'],
        defaultBlockAttributes: ['contenteditable'],
      };
      
      const instance = new BetterKeyPress(customOptions);
      expect(instance.target).toBe(customTarget);
      expect(instance.defaultBlockElements).toEqual(['input', 'textarea']);
      expect(instance.defaultBlockAttributes).toEqual(['contenteditable']);
    });
  });

  describe('block element management', () => {
    it('should add block elements', () => {
      betterKeyPress.addBlockElement('button');
      expect(betterKeyPress.defaultBlockElements).toContain('button');
    });

    it('should remove block elements', () => {
      betterKeyPress.removeBlockElement('input');
      expect(betterKeyPress.defaultBlockElements).not.toContain('input');
    });

    it('should add block attributes', () => {
      betterKeyPress.addBlockAttribute('data-no-keypress');
      expect(betterKeyPress.defaultBlockAttributes).toContain('data-no-keypress');
    });

    it('should remove block attributes', () => {
      betterKeyPress.removeBlockAttribute('contenteditable');
      expect(betterKeyPress.defaultBlockAttributes).not.toContain('contenteditable');
    });
  });

  describe('event registration', () => {
    it('should register single key handler', () => {
      const handler = jest.fn();
      betterKeyPress.on('a', handler);
      
      const events = betterKeyPress.eventMap.get('a');
      expect(events).toHaveLength(1);
      expect(events![0].handler).toBe(handler);
      expect(events![0].preventDefault).toBe(false);
      expect(events![0].stopPropagation).toBe(false);
      expect(events![0].once).toBe(false);
    });

    it('should register handler with options', () => {
      const handler = jest.fn();
      betterKeyPress.on('control + a', handler, {
        preventDefault: true,
        stopPropagation: true,
        once: false,
      });
      
      const events = betterKeyPress.eventMap.get('control + a');
      expect(events).toHaveLength(1);
      expect(events![0].preventDefault).toBe(true);
      expect(events![0].stopPropagation).toBe(true);
      expect(events![0].once).toBe(false);
    });

    it('should register multiple handlers for same key', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2);
      
      const events = betterKeyPress.eventMap.get('a');
      expect(events).toHaveLength(2);
    });

    it('should replace handler when once option is true', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2, { once: true });
      
      const events = betterKeyPress.eventMap.get('a');
      expect(events).toHaveLength(1);
      expect(events![0].handler).toBe(handler2);
      expect(events![0].once).toBe(true);
    });
  });

  describe('event removal', () => {
    it('should remove specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2);
      betterKeyPress.off('a', handler1);
      
      const events = betterKeyPress.eventMap.get('a');
      expect(events).toHaveLength(1);
      expect(events![0].handler).toBe(handler2);
    });

    it('should remove all handlers for a key', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2);
      betterKeyPress.offAll('a');
      
      expect(betterKeyPress.eventMap.has('a')).toBe(false);
    });
  });

  describe('event triggering', () => {
    it('should trigger registered handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2);
      betterKeyPress.trigger('a', keyEvent);
      
      expect(handler1).toHaveBeenCalledWith(keyEvent);
      expect(handler2).toHaveBeenCalledWith(keyEvent);
    });

    it('should not trigger unregistered handlers', () => {
      const handler = jest.fn();
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      
      betterKeyPress.trigger('a', keyEvent);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('event listening lifecycle', () => {
    it('should start listening and add event listeners', () => {
      betterKeyPress.start();
      
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockTarget.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
    });

    it('should stop listening and remove event listeners', () => {
      betterKeyPress.start();
      betterKeyPress.stop();
      
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockTarget.removeEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(betterKeyPress.isListening).toBe(false);
      expect(betterKeyPress.eventMap.size).toBe(0);
      expect(betterKeyPress.activeKeys.size).toBe(0);
      expect(betterKeyPress.activeCodes.size).toBe(0);
    });
  });

  describe('key state management', () => {
    let handleKeyDown: (e: KeyboardEvent) => void;
    let handleKeyUp: (e: KeyboardEvent) => void;
    let handleBlur: () => void;

    beforeEach(() => {
      betterKeyPress.start();
      
      // Extract the actual event handlers
      const addEventListenerCalls = (mockTarget.addEventListener as jest.Mock).mock.calls;
      handleKeyDown = addEventListenerCalls.find(call => call[0] === 'keydown')[1];
      handleKeyUp = addEventListenerCalls.find(call => call[0] === 'keyup')[1];
      handleBlur = addEventListenerCalls.find(call => call[0] === 'blur')[1];
    });

    it('should track active keys on keydown', () => {
      const keyEvent = createKeyboardEvent('keydown', { key: 'A', code: 'KeyA' });
      
      handleKeyDown(keyEvent);
      
      expect(betterKeyPress.activeKeys.has('a')).toBe(true);
      expect(betterKeyPress.activeCodes.has('keya')).toBe(true);
    });

    it('should remove active keys on keyup', () => {
      const keyDownEvent = createKeyboardEvent('keydown', { key: 'A', code: 'KeyA' });
      const keyUpEvent = createKeyboardEvent('keyup', { key: 'A', code: 'KeyA' });
      
      handleKeyDown(keyDownEvent);
      expect(betterKeyPress.activeKeys.has('a')).toBe(true);
      
      handleKeyUp(keyUpEvent);
      expect(betterKeyPress.activeKeys.has('a')).toBe(false);
      expect(betterKeyPress.activeCodes.has('keya')).toBe(false);
    });

    it('should clear all active keys on blur', () => {
      const keyEvent1 = createKeyboardEvent('keydown', { key: 'A', code: 'KeyA' });
      const keyEvent2 = createKeyboardEvent('keydown', { key: 'Control', code: 'ControlLeft' });
      
      handleKeyDown(keyEvent1);
      handleKeyDown(keyEvent2);
      
      expect(betterKeyPress.activeKeys.size).toBe(2);
      expect(betterKeyPress.activeCodes.size).toBe(2);
      
      handleBlur();
      
      expect(betterKeyPress.activeKeys.size).toBe(0);
      expect(betterKeyPress.activeCodes.size).toBe(0);
    });

    it('should handle meta key combinations correctly', async () => {
      const keyEvent = createKeyboardEvent('keydown', { 
        key: 'a', 
        code: 'KeyA',
        metaKey: true 
      });
      
      handleKeyDown(keyEvent);
      
      expect(betterKeyPress.activeKeys.has('a')).toBe(true);
      
      // Should remove the key after nextTick when metaKey is pressed
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(betterKeyPress.activeKeys.has('a')).toBe(false);
    });

    it('should not auto-remove meta, control, or shift keys', async () => {
      const metaEvent = createKeyboardEvent('keydown', { 
        key: 'Meta', 
        code: 'MetaLeft',
        metaKey: true 
      });
      
      handleKeyDown(metaEvent);
      
      expect(betterKeyPress.activeKeys.has('meta')).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Meta key should still be active
      expect(betterKeyPress.activeKeys.has('meta')).toBe(true);
    });
  });

  describe('blocking behavior', () => {
    let handleKeyDown: (e: KeyboardEvent) => void;

    beforeEach(() => {
      betterKeyPress.start();
      const addEventListenerCalls = (mockTarget.addEventListener as jest.Mock).mock.calls;
      handleKeyDown = addEventListenerCalls.find(call => call[0] === 'keydown')[1];
    });

    it('should block events on input elements', () => {
      const handler = jest.fn();
      const input = createMockElement('input');
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: input });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should block events on textarea elements', () => {
      const handler = jest.fn();
      const textarea = createMockElement('textarea');
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: textarea });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should block events on elements with contenteditable', () => {
      const handler = jest.fn();
      const div = createMockElement('div', { contenteditable: 'true' });
      document.body.appendChild(div);
      
      const textNode = document.createTextNode('test');
      div.appendChild(textNode);
      
      (window.getSelection as jest.Mock).mockReturnValue({
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue({
          commonAncestorContainer: textNode,
        }),
      });
      
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: div });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should block events on elements with block-keypress attribute', () => {
      const handler = jest.fn();
      const div = createMockElement('div', { 'block-keypress': 'true' });
      document.body.appendChild(div);
      
      (window.getSelection as jest.Mock).mockReturnValue({
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue({
          commonAncestorContainer: div,
        }),
      });
      
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: div });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not block events on regular elements', () => {
      const handler = jest.fn();
      const div = createMockElement('div');
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: div });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).toHaveBeenCalledWith(keyEvent);
    });
  });

  describe('event execution', () => {
    let handleKeyDown: (e: KeyboardEvent) => void;

    beforeEach(() => {
      betterKeyPress.start();
      const addEventListenerCalls = (mockTarget.addEventListener as jest.Mock).mock.calls;
      handleKeyDown = addEventListenerCalls.find(call => call[0] === 'keydown')[1];
    });

    it('should execute handlers for matching keys', () => {
      const handler = jest.fn();
      const keyEvent = createKeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
      Object.defineProperty(keyEvent, 'target', { value: document.body });
      
      betterKeyPress.on('a', handler);
      handleKeyDown(keyEvent);
      
      expect(handler).toHaveBeenCalledWith(keyEvent);
    });

    it('should call preventDefault when specified', () => {
      const handler = jest.fn();
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: document.body });
      keyEvent.preventDefault = jest.fn();
      
      betterKeyPress.on('a', handler, { preventDefault: true });
      handleKeyDown(keyEvent);
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call stopPropagation when specified', () => {
      const handler = jest.fn();
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: document.body });
      keyEvent.stopPropagation = jest.fn();
      
      betterKeyPress.on('a', handler, { stopPropagation: true });
      handleKeyDown(keyEvent);
      
      expect(keyEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle async handlers', async () => {
      const asyncHandler = jest.fn().mockResolvedValue('done');
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: document.body });
      
      betterKeyPress.on('a', asyncHandler);
      handleKeyDown(keyEvent);
      
      // Give time for async execution
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(asyncHandler).toHaveBeenCalledWith(keyEvent);
    });

    it('should execute multiple handlers in order', () => {
      const order: number[] = [];
      const handler1 = jest.fn(() => order.push(1));
      const handler2 = jest.fn(() => order.push(2));
      const keyEvent = createKeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(keyEvent, 'target', { value: document.body });
      
      betterKeyPress.on('a', handler1);
      betterKeyPress.on('a', handler2);
      handleKeyDown(keyEvent);
      
      expect(handler1).toHaveBeenCalledWith(keyEvent);
      expect(handler2).toHaveBeenCalledWith(keyEvent);
      expect(order).toEqual([1, 2]);
    });

    it('should handle key combinations correctly', () => {
      const handler = jest.fn();
      const ctrlEvent = createKeyboardEvent('keydown', { 
        key: 'Control', 
        code: 'ControlLeft'
      });
      const aEvent = createKeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
      Object.defineProperty(ctrlEvent, 'target', { value: document.body });
      Object.defineProperty(aEvent, 'target', { value: document.body });
      
      betterKeyPress.on('control + a', handler);
      
      // Press Control first
      handleKeyDown(ctrlEvent);
      expect(handler).not.toHaveBeenCalled();
      
      // Then press 'a'
      handleKeyDown(aEvent);
      expect(handler).toHaveBeenCalledWith(aEvent);
    });
  });
}); 