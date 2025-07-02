import { sameCode, hasAttr, getLocalName, nextTick } from '../src/util';

// Global test utilities
declare global {
  var createMockElement: (tagName: string, attributes?: Record<string, string>) => HTMLElement;
}

describe('sameCode', () => {
  it('should match single key', () => {
    const activeKeys = new Set(['a']);
    const activeCodes = new Set(['keya']);
    
    expect(sameCode('a', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('keya', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('b', activeKeys, activeCodes)).toBe(false);
  });

  it('should match key combinations', () => {
    const activeKeys = new Set(['control', 'a']);
    const activeCodes = new Set(['controlleft', 'keya']);
    
    expect(sameCode('control + a', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('controlleft + keya', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('control + b', activeKeys, activeCodes)).toBe(false);
  });

  it('should match multiple alternatives with pipe', () => {
    const activeKeys = new Set(['a']);
    const activeCodes = new Set(['keya']);
    
    expect(sameCode('a|b|c', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('x|y|z', activeKeys, activeCodes)).toBe(false);
  });

  it('should handle complex combinations with alternatives', () => {
    const activeKeys = new Set(['control', 'shift', 'a']);
    const activeCodes = new Set(['controlleft', 'shiftleft', 'keya']);
    
    expect(sameCode('control + shift + a|control + b', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('alt + a|meta + b', activeKeys, activeCodes)).toBe(false);
  });

  it('should be case insensitive', () => {
    const activeKeys = new Set(['a']);
    const activeCodes = new Set(['keya']);
    
    expect(sameCode('A', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('KEYA', activeKeys, activeCodes)).toBe(true);
  });

  it('should handle whitespace in combinations', () => {
    const activeKeys = new Set(['control', 'a']);
    const activeCodes = new Set(['controlleft', 'keya']);
    
    expect(sameCode('control+a', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('control +  a', activeKeys, activeCodes)).toBe(true);
    expect(sameCode('  control  +  a  ', activeKeys, activeCodes)).toBe(true);
  });
});

describe('hasAttr', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Reset getSelection mock
    (window.getSelection as jest.Mock).mockClear();
  });

  it('should return false when no selection exists', () => {
    (window.getSelection as jest.Mock).mockReturnValue(null);
    expect(hasAttr('contenteditable')).toBe(false);
  });

  it('should return false when selection has no ranges', () => {
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 0,
      getRangeAt: jest.fn(),
    });
    expect(hasAttr('contenteditable')).toBe(false);
  });

  it('should return true when element has the attribute', () => {
    const element = createMockElement('div', { contenteditable: 'true' });
    document.body.appendChild(element);
    
    const textNode = document.createTextNode('test');
    element.appendChild(textNode);
    
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        commonAncestorContainer: textNode,
      }),
    });
    
    expect(hasAttr('contenteditable')).toBe(true);
  });

  it('should return true when parent element has the attribute', () => {
    const parent = createMockElement('div', { 'block-keypress': 'true' });
    const child = createMockElement('span');
    parent.appendChild(child);
    document.body.appendChild(parent);
    
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        commonAncestorContainer: child,
      }),
    });
    
    expect(hasAttr('block-keypress')).toBe(true);
  });

  it('should return false when no ancestor has the attribute', () => {
    const element = createMockElement('div');
    document.body.appendChild(element);
    
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        commonAncestorContainer: element,
      }),
    });
    
    expect(hasAttr('contenteditable')).toBe(false);
  });

  it('should stop searching at document.body', () => {
    const element = createMockElement('div');
    document.body.appendChild(element);
    
    (window.getSelection as jest.Mock).mockReturnValue({
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        commonAncestorContainer: element,
      }),
    });
    
    // Even if body has the attribute, it should not be found
    document.body.setAttribute('contenteditable', 'true');
    expect(hasAttr('contenteditable')).toBe(false);
  });
});

describe('getLocalName', () => {
  it('should return the local name of an element', () => {
    const div = createMockElement('div');
    const input = createMockElement('input');
    const customElement = createMockElement('custom-element');
    
    expect(getLocalName(div)).toBe('div');
    expect(getLocalName(input)).toBe('input');
    expect(getLocalName(customElement)).toBe('custom-element');
  });
});

describe('nextTick', () => {
  it('should execute callback in next tick', async () => {
    const callback = jest.fn();
    await nextTick(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should work without callback', async () => {
    await expect(nextTick()).resolves.toBeUndefined();
  });

  it('should execute multiple nextTick calls in order', async () => {
    const order: number[] = [];
    
    nextTick(() => order.push(1));
    nextTick(() => order.push(2));
    nextTick(() => order.push(3));
    
    // Wait for all to complete
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(order).toEqual([1, 2, 3]);
  });

  it('should handle synchronous execution when queueMicrotask is not available', async () => {
    const originalQueueMicrotask = window.queueMicrotask;
    delete (window as any).queueMicrotask;
    
    const callback = jest.fn();
    await nextTick(callback);
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Restore
    window.queueMicrotask = originalQueueMicrotask;
  });
}); 