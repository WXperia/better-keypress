export function sameCode(
  code: string,
  keyKeyNameStrck: Set<string>,
  keyCodeStrck: Set<string>
) {
  const codes = code.toLowerCase().split("|");

  return codes.some((item) => {
    const arr = item.split("+");
    return (
      arr.length === keyKeyNameStrck.size &&
      arr.every((v) => {
        return keyKeyNameStrck.has(v.trim()) || keyCodeStrck.has(v.trim());
      })
    );
  });
}

export function hasAttr(attr: string) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);
  let current = range.commonAncestorContainer;

  // If the common ancestor is a text node, get its parent element
  if (current.nodeType === Node.TEXT_NODE) {
    current = current.parentElement!;
  }

  while (current && current !== document.body && current instanceof Element) {
    if (current.hasAttribute(attr)) {
      return true;
    }
    current = current.parentElement!;
  }
  return false;
}

export function getLocalName(el: Element) {
  return el.localName;
}


export function nextTick(callback?: () => void): Promise<void> {
  const promise = new Promise<void>((resolve) => {
    if (typeof window !== 'undefined' && window.queueMicrotask) {
      // Use queueMicrotask if available (modern browsers)
      window.queueMicrotask(() => {
        if (callback) callback();
        resolve();
      });
    } else if (typeof Promise !== 'undefined') {
      // Fallback to Promise.resolve().then()
      Promise.resolve().then(() => {
        if (callback) callback();
        resolve();
      });
    } else {
      // Fallback to setTimeout for very old environments
      setTimeout(() => {
        if (callback) callback();
        resolve();
      }, 0);
    }
  });

  return promise;
}
