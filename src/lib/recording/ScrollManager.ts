import { RECORDING_SETTINGS } from "../constants";

export class ScrollManager {
  private element: HTMLElement;
  private scrollInterval: number | null = null;
  private startTime: number | null = null;
  private onScrollUpdate: ((progress: number) => void) | null = null;
  private lastScrollPosition = 0;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  setCallback(onScrollUpdate: (progress: number) => void) {
    this.onScrollUpdate = onScrollUpdate;
  }

  startAutoScroll(isRecordingActive: () => boolean) {
    console.log("Starting auto-scroll...");

    // Reset scroll position
    this.element.scrollTop = 0;
    this.lastScrollPosition = 0;

    // Calculate scroll parameters
    const totalScrollHeight = this.element.scrollHeight - this.element.clientHeight;
    const scrollDuration = RECORDING_SETTINGS.RECORDING_TIME * 1000;

    console.log("Scroll parameters:", {
      totalHeight: this.element.scrollHeight,
      visibleHeight: this.element.clientHeight,
      scrollableHeight: totalScrollHeight,
      duration: scrollDuration,
    });

    const scroll = (timestamp: number) => {
      // Initialize start time on first frame
      if (!this.startTime) {
        this.startTime = timestamp;
      }

      // Calculate progress
      const elapsed = timestamp - this.startTime;
      const progressPercent = Math.min(elapsed / scrollDuration, 1);

      // Check if recording is still active
      if (!isRecordingActive()) {
        console.log("Recording stopped, canceling scroll");
        this.stopAutoScroll();
        return;
      }

      // Update scroll position using easing function
      if (elapsed < scrollDuration) {
        // Use custom easing for smoother scrolling
        const easeProgress = this.easeInOutQuart(progressPercent);
        const targetScrollPosition = Math.round(easeProgress * totalScrollHeight);

        // Apply enhanced smooth interpolation
        const scrollDiff = targetScrollPosition - this.lastScrollPosition;
        if (Math.abs(scrollDiff) > 0.1) {
          const smoothedPosition = this.lastScrollPosition + scrollDiff * 0.05;
          this.element.scrollTop = smoothedPosition;
          this.lastScrollPosition = smoothedPosition;
        }

        if (this.onScrollUpdate) {
          this.onScrollUpdate(progressPercent);
        }

        // Continue animation
        this.scrollInterval = requestAnimationFrame(scroll);
      } else {
        console.log("Scroll animation complete");
        this.stopAutoScroll();
      }
    };

    // Start animation
    this.scrollInterval = requestAnimationFrame(scroll);
  }

  // Quartic easing for extra smooth acceleration and deceleration
  private easeInOutQuart(t: number): number {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      console.log("Stopping auto-scroll");
      cancelAnimationFrame(this.scrollInterval);
      this.scrollInterval = null;
    }
    this.startTime = null;
    this.lastScrollPosition = 0;
  }

  cleanup() {
    console.log("Cleaning up ScrollManager");
    this.stopAutoScroll();
  }
}
