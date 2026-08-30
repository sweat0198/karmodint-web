import { computed, ref } from "vue";
import {
  ZOOM_DEFAULT,
  ZOOM_STEP,
  clampPan,
  clampZoom,
  type PanOffset,
  type StageSize,
} from "~/utils/panZoom";

/** How far one arrow key press moves the view. */
const KEY_STEP = 40;

/**
 * Controls that live inside the stage — the carousel's arrows. A press on one of these is a click,
 * not the start of a drag: capturing the pointer here would retarget the compat mouse events at
 * the stage and swallow the button's own `click`.
 */
const CONTROL_SELECTOR = "button, a, input, select, textarea, [role='button']";

const PAN_KEYS: Record<string, PanOffset> = {
  // Arrows move the viewport, as scrolling does, so the frame travels the opposite way.
  ArrowRight: { x: -1, y: 0 },
  ArrowLeft: { x: 1, y: 0 },
  ArrowDown: { x: 0, y: -1 },
  ArrowUp: { x: 0, y: 1 },
};

/**
 * Zoom and drag-to-pan for an image stage.
 *
 * Pan is deliberately unavailable at or below 100%: with the whole frame already in view there is
 * nowhere to go, and a grab cursor that moves nothing reads as a broken control.
 *
 * @param getStageSize Measures the visible stage box. Read on demand, since it changes with the
 * viewport — bounds are never cached.
 */
export function usePanZoom(getStageSize: () => StageSize) {
  const zoom = ref(ZOOM_DEFAULT);
  const offset = ref<PanOffset>({ x: 0, y: 0 });
  const isPanning = ref(false);
  /**
   * A pan is the user moving the frame themselves — by drag or by a held arrow key, which repeats
   * every ~30ms. Either way the frame must land where they put it, not ease there over 300ms.
   * Only the zoom steps animate.
   */
  const movesInstantly = ref(false);

  /** The pointer that started the drag — a second finger must not yank the frame around. */
  let activePointerId: number | null = null;
  let dragOrigin = { pointer: { x: 0, y: 0 }, offset: { x: 0, y: 0 } };

  const canPan = computed(() => zoom.value > ZOOM_DEFAULT);
  const isDefaultView = computed(
    () => zoom.value === ZOOM_DEFAULT && offset.value.x === 0 && offset.value.y === 0,
  );

  const frameStyle = computed<Record<string, string>>(() => ({
    transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${zoom.value / 100})`,
    ...(movesInstantly.value ? { transition: "none" } : {}),
  }));

  function panTo(next: PanOffset) {
    offset.value = clampPan(next, zoom.value, getStageSize());
  }

  function setZoom(next: number) {
    movesInstantly.value = false;
    zoom.value = clampZoom(next);
    // Zooming back out leaves the old offset outside the new bounds — re-clamping walks the frame
    // back to centre rather than stranding empty canvas in the stage.
    panTo(offset.value);
  }

  const zoomIn = () => setZoom(zoom.value + ZOOM_STEP);
  const zoomOut = () => setZoom(zoom.value - ZOOM_STEP);

  function resetView() {
    movesInstantly.value = false;
    zoom.value = ZOOM_DEFAULT;
    offset.value = { x: 0, y: 0 };
  }

  /** Re-clamps to the bounds the stage has now — call after it has been resized. */
  function refreshView() {
    movesInstantly.value = false;
    panTo(offset.value);
  }

  function onPointerDown(event: PointerEvent) {
    if (!canPan.value || event.button !== 0) return;
    const target = event.target as { closest?: (selector: string) => unknown } | null;
    if (target?.closest?.(CONTROL_SELECTOR)) return;

    isPanning.value = true;
    movesInstantly.value = true;
    activePointerId = event.pointerId;
    dragOrigin = {
      pointer: { x: event.clientX, y: event.clientY },
      offset: { ...offset.value },
    };
    const stage = event.currentTarget as (Element & Partial<HTMLElement>) | null;
    // Keeps the drag alive past the stage's edges, and stops the browser's native image drag from
    // hijacking the gesture with a ghost image.
    stage?.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    // `preventDefault` suppresses the compat `mousedown`, and with it the focus a click would
    // normally give the stage — so the arrow keys are handed the frame the user just grabbed.
    stage?.focus?.();
  }

  function onPointerMove(event: PointerEvent) {
    if (!isPanning.value || event.pointerId !== activePointerId) return;

    panTo({
      x: dragOrigin.offset.x + event.clientX - dragOrigin.pointer.x,
      y: dragOrigin.offset.y + event.clientY - dragOrigin.pointer.y,
    });
  }

  /**
   * Ends the drag on release, cancel, or lost capture. `pointerleave` is wired to it too: where
   * capture took, boundary events are suppressed for the duration and it never fires, and where it
   * did not, it is the only thing that stops a drag the user released off-stage.
   */
  function onPointerEnd(event?: PointerEvent) {
    if (!isPanning.value) return;
    if (event && activePointerId !== null && event.pointerId !== activePointerId) return;

    isPanning.value = false;
    if (event && activePointerId !== null) {
      (event.currentTarget as (Element & Partial<HTMLElement>) | null)?.releasePointerCapture?.(
        activePointerId,
      );
    }
    activePointerId = null;
  }

  function onKeydown(event: KeyboardEvent) {
    const direction = PAN_KEYS[event.key];
    if (!direction || !canPan.value) return;

    event.preventDefault();
    movesInstantly.value = true;
    panTo({
      x: offset.value.x + direction.x * KEY_STEP,
      y: offset.value.y + direction.y * KEY_STEP,
    });
  }

  return {
    zoom,
    isPanning,
    canPan,
    isDefaultView,
    frameStyle,
    zoomIn,
    zoomOut,
    resetView,
    refreshView,
    onPointerDown,
    onPointerMove,
    onPointerEnd,
    onKeydown,
  };
}
