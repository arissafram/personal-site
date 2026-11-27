declare module "mikes" {
  export interface MikesOptions {
    /** What listens for clicks/taps. Defaults to the element. */
    pointerTarget?: EventTarget;
    /** localStorage key for the high score. */
    storageKey?: string;
    invincible?: boolean;
    /** false starts it paused. */
    active?: boolean;
    /** Space and Up don't scroll the page or press a focused button while it runs. */
    captureKeys?: boolean;
  }

  export interface MikesGame {
    pause(): void;
    resume(): void;
    destroy(): void;
  }

  export function mount(el: HTMLElement, options?: MikesOptions): MikesGame;
}
