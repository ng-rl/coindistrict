import { PLOT_SPACING } from './constants';

type FocusListener = (index: number) => void;
type TapListener = (clientX: number, clientY: number) => void;
type ScrollListener = () => void;

/**
 * Owns the rank-axis position of the camera. Native-feeling drag with inertia and
 * snap-to-plot, wheel/trackpad, keyboard. Horizontal only: one thumb gesture = power ranking.
 */
export class StreetController {
  x = 0;
  private vx = 0;
  count = 1;
  /** world units per CSS pixel, set by the camera rig every frame */
  unitsPerPx = 0.03;

  private el: HTMLElement | null = null;
  private dragging = false;
  private pointerId = -1;
  private lastX = 0;
  private lastT = 0;
  private downX = 0;
  private downY = 0;
  private downT = 0;
  private moved = 0;
  private samples: { x: number; t: number }[] = [];
  private anim: { from: number; to: number; start: number; dur: number } | null = null;
  private wheelTimer: number | null = null;
  private focus = -1;
  private hasScrolled = false;

  private focusListeners = new Set<FocusListener>();
  private tapListeners = new Set<TapListener>();
  private scrollListeners = new Set<ScrollListener>();

  get maxX() {
    return Math.max(0, this.count - 1) * PLOT_SPACING;
  }

  get focusIndex() {
    return Math.max(0, Math.min(this.count - 1, Math.round(this.x / PLOT_SPACING)));
  }

  get isDragging() {
    return this.dragging;
  }

  onFocus(fn: FocusListener) {
    this.focusListeners.add(fn);
    return () => {
      this.focusListeners.delete(fn);
    };
  }
  onTap(fn: TapListener) {
    this.tapListeners.add(fn);
    return () => {
      this.tapListeners.delete(fn);
    };
  }
  onFirstScroll(fn: ScrollListener) {
    this.scrollListeners.add(fn);
    return () => {
      this.scrollListeners.delete(fn);
    };
  }

  attach(el: HTMLElement) {
    this.el = el;
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKey);
    return () => this.detach();
  }

  detach() {
    const el = this.el;
    if (!el) return;
    el.removeEventListener('pointerdown', this.onDown);
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('pointercancel', this.onUp);
    el.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
    this.el = null;
  }

  goTo(index: number, dur = 520) {
    const i = Math.max(0, Math.min(this.count - 1, index));
    const to = i * PLOT_SPACING;
    this.vx = 0;
    if (dur <= 0) {
      this.x = to;
      this.anim = null;
      this.emitFocus();
      return;
    }
    this.anim = { from: this.x, to, start: performance.now(), dur };
  }

  /** Called once per frame by the camera rig. */
  update(now: number, dt: number) {
    if (this.dragging) return;
    if (this.anim) {
      const t = Math.min(1, (now - this.anim.start) / this.anim.dur);
      const e = 1 - Math.pow(1 - t, 3);
      this.x = this.anim.from + (this.anim.to - this.anim.from) * e;
      if (t >= 1) this.anim = null;
    } else if (Math.abs(this.vx) > 0.02) {
      this.x += this.vx * dt;
      this.vx *= Math.pow(0.0025, dt); // friction
      const over = this.x < 0 ? -this.x : this.x > this.maxX ? this.x - this.maxX : 0;
      if (over > 0) this.vx *= Math.pow(0.0001, dt);
      if (Math.abs(this.vx) <= 0.6) this.snap();
    }
    this.emitFocus();
  }

  private snap() {
    // project a little further in the direction of travel, then snap to nearest plot
    const projected = this.x + this.vx * 0.12;
    const i = Math.round(projected / PLOT_SPACING);
    this.vx = 0;
    this.goTo(i, 480);
  }

  private emitFocus() {
    const f = this.focusIndex;
    if (f !== this.focus) {
      this.focus = f;
      this.focusListeners.forEach((fn) => fn(f));
    }
  }

  private markScrolled() {
    if (this.hasScrolled) return;
    this.hasScrolled = true;
    this.scrollListeners.forEach((fn) => fn());
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    this.dragging = true;
    this.pointerId = e.pointerId;
    this.el?.setPointerCapture(e.pointerId);
    this.anim = null;
    this.vx = 0;
    this.lastX = this.downX = e.clientX;
    this.downY = e.clientY;
    this.lastT = this.downT = performance.now();
    this.moved = 0;
    this.samples = [{ x: e.clientX, t: this.lastT }];
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.lastT = now;
    this.moved = Math.max(this.moved, Math.hypot(e.clientX - this.downX, e.clientY - this.downY));
    let next = this.x - dx * this.unitsPerPx;
    // rubber band past the ends of the street
    if (next < 0) next = next * 0.35;
    else if (next > this.maxX) next = this.maxX + (next - this.maxX) * 0.35;
    this.x = next;
    this.samples.push({ x: e.clientX, t: now });
    if (this.samples.length > 6) this.samples.shift();
    if (this.moved > 6) this.markScrolled();
    this.emitFocus();
  };

  private onUp = (e: PointerEvent) => {
    if (!this.dragging || e.pointerId !== this.pointerId) return;
    this.dragging = false;
    const now = performance.now();
    const isTap = this.moved < 8 && now - this.downT < 400;
    if (isTap) {
      this.vx = 0;
      this.goTo(this.focusIndex, 320);
      this.tapListeners.forEach((fn) => fn(e.clientX, e.clientY));
      return;
    }
    // velocity from the last ~80ms of samples
    const recent = this.samples.filter((s) => now - s.t < 90);
    const first = recent[0] ?? this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = Math.max(16, last.t - first.t) / 1000;
    const pxPerS = (last.x - first.x) / dt;
    this.vx = -pxPerS * this.unitsPerPx;
    if (now - this.lastT > 80) this.vx = 0;
    if (Math.abs(this.vx) < 1.2) this.snap();
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    this.anim = null;
    this.vx = 0;
    this.x = Math.max(-1, Math.min(this.maxX + 1, this.x + delta * this.unitsPerPx * 0.9));
    this.markScrolled();
    this.emitFocus();
    if (this.wheelTimer) window.clearTimeout(this.wheelTimer);
    this.wheelTimer = window.setTimeout(() => this.goTo(this.focusIndex, 420), 140);
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      this.goTo(this.focusIndex + 1);
      this.markScrolled();
    } else if (e.key === 'ArrowLeft') {
      this.goTo(this.focusIndex - 1);
      this.markScrolled();
    }
  };
}
