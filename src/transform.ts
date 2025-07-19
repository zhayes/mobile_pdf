import type { Boundary } from "./types";

export default class Transform {
  private translate_x = 0;
  private translate_y = 0;
  private scale = 1;

  private is_dragging = false;
  private is_pinching = false;

  public transform_el: HTMLElement;
  public wrapper_el: HTMLElement;

  readonly boundary: Boundary;

  constructor(
     transform_el: HTMLElement,
     wrapper_el: HTMLElement,
     boundary?: Boundary
  ) {
    this.transform_el = transform_el;
    this.wrapper_el = wrapper_el;

    this.boundary = Object.assign({left: 50,right: 50,top: 50,bottom: 50, min_scale: 0.5, max_scale: 4}, boundary);

    this.transform_el.style.touchAction = 'none';
    this.transform_el.style.willChange = 'transform';
    this.transform_el.style.transformOrigin = '0 0';
    this.transform_el.style.transition = 'none';

    this.transform({});
  }

  set_dragging = (value: boolean) => {
    this.is_dragging = value;
  }

  set_pinching = (value: boolean) => {
    this.is_pinching = value;
  }

  get_dragging = () => {
    return this.is_dragging;
  }

  get_pinching = () => {
    return this.is_pinching;
  }

  get_translate = () => {
    return { translate_x: this.translate_x, translate_y: this.translate_y };
  }

  get_scale = () => {
    return this.scale;
  }

  transform = (position?:{ translate_x?: number; translate_y?: number; scale?: number; }) => {
    if (position?.translate_x!=undefined) {
      this.translate_x = position.translate_x;
    }
    if (position?.translate_y!=undefined) {
      this.translate_y = position.translate_y;
    }
    if (position?.scale!=undefined) {
      this.scale = position.scale;
    }

    requestAnimationFrame(() => {
      this.transform_el.style.transform = `translate3d(${this.translate_x}px, ${this.translate_y}px, 0) scale(${this.scale})`;
    });
  }

  reset_transform = () => {
    this.translate_x = 0;
    this.translate_y = 0;
    this.scale = 1;

    this.transform()
  }

  constrain_boundary = (x:number, y:number) => {
    const transform_rect = this.transform_el.getBoundingClientRect();
    const wrapper_rect = this.wrapper_el.getBoundingClientRect();

    let translate_x = x;
    let translate_y = y;


    if (this.scale===1) {
      translate_x = 0;
    }

    if (this.scale===1 && transform_rect.height > wrapper_rect.height) {
      translate_y = Math.min(translate_y, 0);
    }


    if (this.scale>1) {
      translate_x = Math.max(wrapper_rect.width - transform_rect.width - this.boundary.right, Math.min(translate_x, this.boundary.left));
    }

    if (this.scale<1) {
      translate_x = Math.min(wrapper_rect.width - transform_rect.width, Math.max(translate_x, 0));
    }


    if (transform_rect.height < wrapper_rect.height) {
      translate_y = Math.min(wrapper_rect.height - transform_rect.height, Math.max(translate_y, 0));
    } else {
      translate_y = Math.max( wrapper_rect.height - transform_rect.height  - this.boundary.bottom, Math.min(translate_y, this.boundary.top));
    }



    return {
      translate_x,
      translate_y,
    }
  }

}
