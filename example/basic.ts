import {
  DefProtocolMarker,
  ImplBase,
  generateRegisterImpl,
  getImpl,
} from 'pojopoly';

interface CanvasRenderingContext2D {
  beginPath(): void;
  stroke(): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void;
  rect(x: number, y: number, w: number, h: number): void;
}

//
// Define protocol (like superclass)
//

const drawableKey = Symbol('MyApp.Drawable');
const subtypeKey = 'kind';
type Drawable = DefProtocolMarker<typeof drawableKey, typeof subtypeKey>;
// `DefProtocolMarker` generates `{<drawableKey>?: {/** Some info */}}` for type annotation.
// Practically, `Drawable` is `{}`.

interface DrawableImpl {
  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D;
}

namespace Drawable {
  export const registerImpl = generateRegisterImpl<DrawableImpl>(drawableKey);

  function v(drawable: Drawable): DrawableImpl {
    return getImpl<Drawable>(drawableKey, subtypeKey, drawable);
  }

  export function draw(
    drawable: Drawable,
    ctx: CanvasRenderingContext2D
  ): CanvasRenderingContext2D {
    return v(drawable).draw(ctx);
  }
}

//
// Define types (like subclass fields)
//

type Drawer = (
  | {
      kind: 'circle';
      pos: {x: number; y: number};
      radius: number;
    }
  | {
      kind: 'rect';
      pos: {x: number; y: number};
      size: {x: number; y: number};
    }
) &
  Drawable; // Intersect Marker for type annotation

//
// Define implements (like subclasses methods)
//

class ImplDrawerForCircle
  extends ImplBase<Drawer & {kind: 'circle'}>
  implements DrawableImpl
{
  static subtypeId = 'circle';

  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
    const {pos, radius} = this.v; // circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return ctx;
  }
}
Drawable.registerImpl(ImplDrawerForCircle);

class ImplDrawerForRect
  extends ImplBase<Drawer & {kind: 'rect'}>
  implements DrawableImpl
{
  static subtypeId = 'rect';

  draw(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D {
    const {pos, size} = this.v; // rect
    ctx.beginPath();
    ctx.rect(pos.x, pos.y, size.x, size.y);
    ctx.stroke();
    return ctx;
  }
}
Drawable.registerImpl(ImplDrawerForRect);

//
// usage
//

const ctx = null as any as CanvasRenderingContext2D;
const drawerRect: Drawer = {
  kind: 'rect',
  pos: {x: 1, y: 2},
  size: {x: 11, y: 12},
};
Drawable.draw(drawerRect, ctx);
