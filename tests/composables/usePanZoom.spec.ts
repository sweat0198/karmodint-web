import { describe, expect, it } from "vitest";
import { usePanZoom } from "~/composables/usePanZoom";
import { ZOOM_MAX, ZOOM_MIN, type StageSize } from "~/utils/panZoom";

const STAGE = { width: 640, height: 360 };

function viewer(stage: StageSize = { ...STAGE }) {
  return { ...usePanZoom(() => stage), stage };
}

type Viewer = ReturnType<typeof viewer>;

/** The offset is only observable through the frame's transform, which is the point of the API. */
function translation(view: Viewer): { x: number; y: number } {
  const [, x, y] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(view.frameStyle.value.transform)!;
  return { x: Number(x), y: Number(y) };
}

function pointer(x: number, y: number, overrides: Record<string, unknown> = {}) {
  return {
    pointerId: 1,
    button: 0,
    clientX: x,
    clientY: y,
    preventDefault: () => {},
    target: null,
    currentTarget: null,
    ...overrides,
  } as unknown as PointerEvent;
}

function key(code: string): KeyboardEvent & { defaultPrevented: boolean } {
  let prevented = false;
  return {
    key: code,
    preventDefault: () => {
      prevented = true;
    },
    get defaultPrevented() {
      return prevented;
    },
  } as unknown as KeyboardEvent & { defaultPrevented: boolean };
}

function drag(view: Viewer, from: [number, number], to: [number, number]) {
  view.onPointerDown(pointer(from[0], from[1]));
  view.onPointerMove(pointer(to[0], to[1]));
  view.onPointerEnd(pointer(to[0], to[1]));
}

describe("usePanZoom", () => {
  it("starts centred at 100% with no pan affordance", () => {
    const view = viewer();

    expect(view.zoom.value).toBe(100);
    expect(view.canPan.value).toBe(false);
    expect(view.isDefaultView.value).toBe(true);
    expect(view.frameStyle.value.transform).toBe("translate(0px, 0px) scale(1)");
  });

  it("steps zoom in and out, stopping at the range ends", () => {
    const view = viewer();

    view.zoomIn();
    expect(view.zoom.value).toBe(120);

    for (let i = 0; i < 10; i += 1) view.zoomIn();
    expect(view.zoom.value).toBe(ZOOM_MAX);

    for (let i = 0; i < 20; i += 1) view.zoomOut();
    expect(view.zoom.value).toBe(ZOOM_MIN);
  });

  it("ignores a drag while the frame still fits its stage", () => {
    const view = viewer();

    drag(view, [0, 0], [120, 80]);

    expect(translation(view)).toEqual({ x: 0, y: 0 });
    expect(view.isPanning.value).toBe(false);
  });

  it("moves the frame by the pointer's travel once zoomed in", () => {
    const view = viewer();
    view.zoomIn(); // 120% — bounds of ±64 × ±36

    view.onPointerDown(pointer(200, 200));
    expect(view.isPanning.value).toBe(true);

    view.onPointerMove(pointer(230, 180));
    expect(view.frameStyle.value.transform).toBe("translate(30px, -20px) scale(1.2)");

    view.onPointerEnd(pointer(230, 180));
    expect(view.isPanning.value).toBe(false);
  });

  it("continues from where the previous drag left the frame", () => {
    const view = viewer();
    view.zoomIn();

    drag(view, [200, 200], [220, 200]);
    drag(view, [200, 200], [220, 200]);

    expect(translation(view).x).toBe(40);
  });

  it("stops the frame at its bounds however far the pointer travels", () => {
    const view = viewer();
    view.zoomIn(); // bounds of ±64 × ±36

    drag(view, [0, 0], [400, 400]);

    expect(translation(view)).toEqual({ x: 64, y: 36 });
  });

  it("never starts a drag from a control inside the stage, so the arrows stay clickable", () => {
    const view = viewer();
    view.zoomIn();

    const onArrow = { closest: (selector: string) => (selector.includes("button") ? {} : null) };
    view.onPointerDown(pointer(200, 200, { target: onArrow }));
    view.onPointerMove(pointer(400, 400));

    expect(view.isPanning.value).toBe(false);
    expect(translation(view)).toEqual({ x: 0, y: 0 });
  });

  it("moves instantly while the user is driving it, and eases only for the zoom steps", () => {
    const view = viewer();

    view.zoomIn();
    expect(view.frameStyle.value.transition).toBeUndefined();

    view.onPointerDown(pointer(200, 200));
    expect(view.frameStyle.value.transition).toBe("none");
    view.onPointerEnd(pointer(200, 200));

    // A held arrow key repeats far faster than the frame could ease between steps.
    view.onKeydown(key("ArrowRight"));
    expect(view.frameStyle.value.transition).toBe("none");

    view.zoomOut();
    expect(view.frameStyle.value.transition).toBeUndefined();
  });

  it("ignores a non-primary button and a second pointer mid-drag", () => {
    const view = viewer();
    view.zoomIn();

    view.onPointerDown(pointer(200, 200, { button: 2 }));
    expect(view.isPanning.value).toBe(false);

    view.onPointerDown(pointer(200, 200));
    view.onPointerMove(pointer(500, 500, { pointerId: 2 }));
    expect(translation(view)).toEqual({ x: 0, y: 0 });
  });

  it("pulls the frame back into view when zoomed back out", () => {
    const view = viewer();
    view.zoomIn();
    view.zoomIn();
    drag(view, [0, 0], [400, 400]);
    expect(translation(view).x).toBeGreaterThan(0);

    view.zoomOut();
    view.zoomOut();

    expect(translation(view)).toEqual({ x: 0, y: 0 });
  });

  it("re-clamps to the bounds a resized stage now has", () => {
    const view = viewer();
    view.zoomIn();
    drag(view, [0, 0], [400, 400]);
    expect(translation(view)).toEqual({ x: 64, y: 36 });

    view.stage.width = 320;
    view.stage.height = 180;
    view.refreshView();

    expect(translation(view)).toEqual({ x: 32, y: 18 });
  });

  it("pans with the arrow keys, so the view is reachable without a pointer", () => {
    const view = viewer();
    view.zoomIn();

    const right = key("ArrowRight");
    view.onKeydown(right);
    // Arrows move the viewport, as scrolling does — the frame travels the other way.
    expect(translation(view).x).toBe(-40);
    expect(right.defaultPrevented).toBe(true);

    view.onKeydown(key("ArrowLeft"));
    view.onKeydown(key("ArrowUp"));
    // The vertical bound (±36 at 120% of a 360px-tall stage) is shorter than one key step.
    expect(translation(view)).toEqual({ x: 0, y: 36 });
  });

  it("leaves other keys and an unzoomed frame alone", () => {
    const view = viewer();

    const arrow = key("ArrowRight");
    view.onKeydown(arrow);
    expect(translation(view)).toEqual({ x: 0, y: 0 });
    expect(arrow.defaultPrevented).toBe(false);

    view.zoomIn();
    const tab = key("Tab");
    view.onKeydown(tab);
    expect(translation(view)).toEqual({ x: 0, y: 0 });
    expect(tab.defaultPrevented).toBe(false);
  });

  it("restores the default view in one step", () => {
    const view = viewer();
    view.zoomIn();
    drag(view, [0, 0], [100, 100]);
    expect(view.isDefaultView.value).toBe(false);

    view.resetView();

    expect(view.zoom.value).toBe(100);
    expect(view.frameStyle.value.transform).toBe("translate(0px, 0px) scale(1)");
    expect(view.isDefaultView.value).toBe(true);
  });
});
