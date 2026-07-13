import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeEvent {
  direction: SwipeDirection;
  deltaX: number;
  deltaY: number;
  durationMs: number;
}

export interface TouchGestureHandlers {
  onLongPress?: (event: ReactPointerEvent | ReactTouchEvent) => void;
  onSwipe?: (event: SwipeEvent) => void;
}

export interface UseTouchGesturesOptions {
  longPressMs?: number;
  swipeThresholdPx?: number;
  swipeMaxDurationMs?: number;
  enabled?: boolean;
}

const DEFAULT_LONG_PRESS_MS = 500;
const DEFAULT_SWIPE_THRESHOLD = 48;
const DEFAULT_SWIPE_MAX_DURATION = 600;

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/** Schedule a long-press callback; returns a cancel function. */
export function longPress(
  ms: number,
  cb: () => void
): { cancel: () => void; promise: Promise<void> } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      cb();
      resolve();
    }, ms);
  });

  return {
    cancel: () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    },
    promise,
  };
}

function detectSwipe(
  start: TouchPoint,
  end: TouchPoint,
  thresholdPx: number,
  maxDurationMs: number
): SwipeEvent | null {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const durationMs = end.time - start.time;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (durationMs > maxDurationMs) return null;
  if (absX < thresholdPx && absY < thresholdPx) return null;

  let direction: SwipeDirection;
  if (absX >= absY) {
    direction = deltaX >= 0 ? 'right' : 'left';
  } else {
    direction = deltaY >= 0 ? 'down' : 'up';
  }

  return { direction, deltaX, deltaY, durationMs };
}

function getPointFromPointer(event: ReactPointerEvent): TouchPoint {
  return { x: event.clientX, y: event.clientY, time: Date.now() };
}

function getPointFromTouch(event: ReactTouchEvent): TouchPoint | null {
  const touch = event.changedTouches[0] ?? event.touches[0];
  if (!touch) return null;
  return { x: touch.clientX, y: touch.clientY, time: Date.now() };
}

/**
 * React hook returning pointer/touch handlers for long-press and swipe detection.
 * Intended to be spread onto the grid viewport element.
 */
export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options: UseTouchGesturesOptions = {}
): {
  onPointerDown: (event: ReactPointerEvent) => void;
  onPointerUp: (event: ReactPointerEvent) => void;
  onPointerCancel: () => void;
  onTouchStart: (event: ReactTouchEvent) => void;
  onTouchEnd: (event: ReactTouchEvent) => void;
} {
  const {
    longPressMs = DEFAULT_LONG_PRESS_MS,
    swipeThresholdPx = DEFAULT_SWIPE_THRESHOLD,
    swipeMaxDurationMs = DEFAULT_SWIPE_MAX_DURATION,
    enabled = true,
  } = options;

  const startPointRef = useRef<TouchPoint | null>(null);
  const pressHandleRef = useRef<ReturnType<typeof longPress> | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const reset = useCallback(() => {
    startPointRef.current = null;
    pressHandleRef.current?.cancel();
    pressHandleRef.current = null;
  }, []);

  const begin = useCallback(
    (point: TouchPoint, sourceEvent: ReactPointerEvent | ReactTouchEvent) => {
      if (!enabled) return;
      startPointRef.current = point;
      pressHandleRef.current?.cancel();
      if (handlersRef.current.onLongPress) {
        pressHandleRef.current = longPress(longPressMs, () =>
          handlersRef.current.onLongPress?.(sourceEvent)
        );
      }
    },
    [enabled, longPressMs]
  );

  const finish = useCallback(
    (point: TouchPoint) => {
      const startPoint = startPointRef.current;
      if (!enabled || !startPoint) {
        reset();
        return;
      }

      pressHandleRef.current?.cancel();
      pressHandleRef.current = null;

      if (handlersRef.current.onSwipe) {
        const swipe = detectSwipe(startPoint, point, swipeThresholdPx, swipeMaxDurationMs);
        if (swipe) handlersRef.current.onSwipe(swipe);
      }

      startPointRef.current = null;
    },
    [enabled, reset, swipeMaxDurationMs, swipeThresholdPx]
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => begin(getPointFromPointer(event), event),
    [begin]
  );
  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => finish(getPointFromPointer(event)),
    [finish]
  );
  const onPointerCancel = useCallback(() => reset(), [reset]);
  const onTouchStart = useCallback(
    (event: ReactTouchEvent) => {
      const point = getPointFromTouch(event);
      if (point) begin(point, event);
    },
    [begin]
  );
  const onTouchEnd = useCallback(
    (event: ReactTouchEvent) => {
      const point = getPointFromTouch(event);
      if (point) finish(point);
    },
    [finish]
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onTouchStart,
    onTouchEnd,
  };
}

/** Non-hook swipe stub for imperative wiring. */
export function createSwipeDetector(options: {
  thresholdPx?: number;
  maxDurationMs?: number;
  onSwipe: (event: SwipeEvent) => void;
}) {
  const thresholdPx = options.thresholdPx ?? DEFAULT_SWIPE_THRESHOLD;
  const maxDurationMs = options.maxDurationMs ?? DEFAULT_SWIPE_MAX_DURATION;
  let start: TouchPoint | null = null;

  return {
    startFromClient(x: number, y: number) {
      start = { x, y, time: Date.now() };
    },
    endFromClient(x: number, y: number) {
      if (!start) return;
      const swipe = detectSwipe(start, { x, y, time: Date.now() }, thresholdPx, maxDurationMs);
      start = null;
      if (swipe) options.onSwipe(swipe);
    },
    cancel() {
      start = null;
    },
  };
}
