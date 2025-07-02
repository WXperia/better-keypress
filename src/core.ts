import { getLocalName, hasAttr, nextTick, sameCode } from "./util";

export interface KeyPressEvent {
  handler: (e: KeyboardEvent) => unknown;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  once?: boolean;
}
export interface BetterKeyPressOptions {
  target?: EventTarget;
  defaultBlockElements?: string[];
  defaultBlockAttributes?: string[];
}
export class BetterKeyPress {
  eventMap: Map<string, KeyPressEvent[]> = new Map();
  activeKeys: Set<string> = new Set();
  activeCodes: Set<string> = new Set();
  isListening: boolean = false;
  target: EventTarget = window;
  defaultBlockElements: string[]
  defaultBlockAttributes: string[]

  constructor(options?: BetterKeyPressOptions) {
    this.target = options?.target ?? window;
    this.defaultBlockElements = options?.defaultBlockElements ?? ["input", "textarea", "select", "option"];
    this.defaultBlockAttributes = options?.defaultBlockAttributes ?? ["contenteditable", "block-keypress"];
  }
  addBlockElement(element: string) {
    this.defaultBlockElements.push(element);
  }
  addBlockAttribute(attribute: string) {
    this.defaultBlockAttributes.push(attribute);
  }
  removeBlockElement(element: string) {
    this.defaultBlockElements = this.defaultBlockElements.filter(item => item !== element);
  }
  removeBlockAttribute(attribute: string) {
    this.defaultBlockAttributes = this.defaultBlockAttributes.filter(item => item !== attribute);
  }
  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    this.activeKeys.add(key);
    this.activeCodes.add(code);
    if(!this.isBlock(e)) {
      this.execute(e);
       // When command is held down, keyup events for other keys won't trigger, so we need to manually remove them
      // Combination function keys are not restricted
      if (e.metaKey && key !== 'meta' && key !== 'control' && key !== 'shift') {
        
        nextTick(() => {
          this.activeKeys.delete(key);
          this.activeCodes.delete(code);
        });
      }
    }
  };
  private isBlock(e: KeyboardEvent) {
    const { target } = e;
    if(!target) return false;
    const localName = getLocalName(target as Element);
    return this.defaultBlockElements.includes(localName) || this.defaultBlockAttributes.some(attr => hasAttr(attr));
  }
  private handleKeyUp = (e: KeyboardEvent) => {
    this.activeKeys.delete(e.key.toLowerCase());
    this.activeCodes.delete(e.code.toLowerCase());
  };
  private handleBlur = () => {
    this.activeKeys.clear();
    this.activeCodes.clear();
  };
  async execute(e: KeyboardEvent) {
    for (const [key, value] of this.eventMap) {
      if (value.length) {
        // debugger
        if (!sameCode(key, this.activeKeys, this.activeCodes)) continue;
        for (let i = 0; i <= value.length - 1; i++) {
          const { handler, preventDefault, stopPropagation } = value[i]!;
          if (preventDefault) {
            e.preventDefault();
          }
          if (stopPropagation) {
            e.stopPropagation();
          }
          const result = handler(e);
          if (result instanceof Promise) {
            await result;
          }
        }
      }
    }
  }

  start(): void {
    this.target.addEventListener(
      "keydown",
      this.handleKeyDown as EventListener
    );
    this.target.addEventListener("keyup", this.handleKeyUp as EventListener);
    this.target.addEventListener("blur", this.handleBlur as EventListener);
  }
  stop(): void {
    this.target.removeEventListener(
      "keydown",
      this.handleKeyDown as EventListener
    );
    this.target.removeEventListener("keyup", this.handleKeyUp as EventListener);
    this.target.removeEventListener("blur", this.handleBlur as EventListener);
    this.isListening = false;
    this.activeKeys.clear();
    this.activeCodes.clear();
  }
  on(
    key: string,
    handler: (e: KeyboardEvent) => unknown,
    options?: Partial<Pick<KeyPressEvent, "preventDefault" | "stopPropagation" | "once">>
  ) {
    const eventConfig = {
      handler,
      preventDefault: options?.preventDefault ?? false,
      stopPropagation: options?.stopPropagation ?? false,
      once: options?.once ?? false,
    };
    if(options?.once) {
      this.eventMap.set(key, [eventConfig]);
    } else {
      this.eventMap.set(key, [...(this.eventMap.get(key) || []), eventConfig]);
    }
  }
  off(key: string, handler: (e: KeyboardEvent) => unknown) {
    const events = this.eventMap.get(key);
    if (events) {
      this.eventMap.set(
        key,
        events.filter((event) => event.handler !== handler)
      );
    }
  }
  offAll(key: string) {
    this.eventMap.delete(key);
  }

  trigger(key: string, e: KeyboardEvent) {
    const events = this.eventMap.get(key);
    if (events) {
      for (const event of events) {
        event.handler(e);
      }
    }
  }
}
