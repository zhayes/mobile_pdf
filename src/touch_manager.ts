import { getDistance, getTouchCenter, isPCByTouch } from "./utils";
import Transform from "./transform";
import { DOUBLE_CLICK_TIMEOUT, DOUBLE_CLICK_DISTANCE } from "./constants";

export default class TouchEventHandler {
  private start_x = 0;
  private start_y = 0;
  private initial_scale = 1;
  private initial_distance = 0;
  private pinch_center = { x: 0, y: 0 };
  private initial_transform = { translate_x: 0, translate_y: 0, scale: 1 };
  private move_history: { x: number; y: number; time: number }[] = [];
  private transform_instance: InstanceType<typeof Transform>;

  private last_touch_time = 0;
  private last_touch_x = 0;
  private last_touch_y = 0;
  private touch_count = 0;

  private animation_frame: number|null = null;

  constructor(transform_instance: InstanceType<typeof Transform>) {
    this.transform_instance = transform_instance;
    !isPCByTouch() && this.addEventListener();
  }

  private touch_start = (e: TouchEvent) => {

    this.stop_smooth_move();

    if (e.touches.length === 1) {
      this.transform_instance.set_dragging(true);
      this.transform_instance.set_pinching(false);
      const { translate_x, translate_y } = this.transform_instance.get_translate();
      this.start_x = e.touches[0].clientX - translate_x;
      this.start_y = e.touches[0].clientY - translate_y;
    } else if (e.touches.length === 2) {
      e.preventDefault();
      this.transform_instance.set_dragging(false);
      this.transform_instance.set_pinching(true);

      // 保存缩放开始时的状态
      this.initial_distance = getDistance(e.touches);
      this.initial_scale = this.transform_instance.get_scale();
      this.pinch_center = getTouchCenter(e.touches);

      // 保存初始变换状态
      const { translate_x, translate_y } = this.transform_instance.get_translate();
      this.initial_transform = {
        translate_x,
        translate_y,
        scale: this.initial_scale
      };
    }
  }

  private touch_move = (e: TouchEvent) => {
    e.preventDefault();
    try {
      if (e.touches.length === 1 && this.transform_instance.get_dragging()) {
        this.move_history.push({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        });
        if (this.move_history.length > 5) {
          this.move_history.shift();
        }
        const new_x = e.touches[0].clientX - this.start_x;
        const new_y = e.touches[0].clientY - this.start_y;
        this.transform_instance.transform(this.transform_instance.constrain_boundary(new_x, new_y));
      }

      if (e.touches.length === 2) {
        const current_distance = getDistance(e.touches);
        if (this.initial_distance === 0) return;

        const scale_ratio = current_distance / this.initial_distance;
        const new_scale = this.initial_scale * scale_ratio;

        const limited_scale = Math.max(this.transform_instance.boundary.min_scale, Math.min(this.transform_instance.boundary.max_scale, new_scale));

        const scale_change = limited_scale / this.initial_scale;

        const new_translate_x =(this.initial_transform.translate_x - this.pinch_center.x) * scale_change + this.pinch_center.x;
        const new_translate_y =(this.initial_transform.translate_y - this.pinch_center.y) * scale_change + this.pinch_center.y;

        this.transform_instance.transform({
          scale: limited_scale,
          translate_x: new_translate_x,
          translate_y: new_translate_y
        });
      }
    } catch (error) {
      console.log(error)
    }
  }

  private start_smooth_move = () => {
    if (this.move_history.length < 2) {
      const { translate_x, translate_y } = this.transform_instance.get_translate();
      this.transform_instance.transform(this.transform_instance.constrain_boundary(translate_x, translate_y))
      return;
    };
    const first_history = this.move_history.shift()!;
    const last_history = this.move_history.pop()!;

    const delta_time = Math.abs(first_history!.time - last_history!.time);
    const delta_x = last_history.x - first_history.x;
    const delta_y = last_history.y - first_history.y;

    if (delta_time === 0) {
      return;
    };

    let vx = (delta_x / delta_time) * 25;
    let vy = (delta_y / delta_time) * 25;

    const damp = 0.95;

    const run_animation = () => {
      const { translate_x, translate_y } = this.transform_instance.get_translate();

      let new_x = translate_x + vx;
      let new_y = translate_y + vy;

      vy = vy * damp;
      vx = vx * damp;

      if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        this.stop_smooth_move();
        return;
      }

      this.transform_instance.transform(this.transform_instance.constrain_boundary(new_x, new_y))

      this.animation_frame = requestAnimationFrame(run_animation)
    }

    this.animation_frame = requestAnimationFrame(run_animation)

  }



  private stop_smooth_move = () => {
      if (this.animation_frame) {
        cancelAnimationFrame(this.animation_frame);
        this.animation_frame = null;
      }
  };

  private touch_end = (e: TouchEvent) => {
    this.transform_instance.set_dragging(false);
    this.transform_instance.set_pinching(false);

    this.start_smooth_move();

    // 重置状态
    this.initial_distance = 0;
    this.move_history = [];

    this.handleDoubleClickDetection(e);
  }

  private handleDoubleClickDetection = (e: TouchEvent) => {
    const now = Date.now();

    if (!this.transform_instance.get_dragging() && !this.transform_instance.get_pinching() && e.touches.length === 0 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      const timeDiff = now - this.last_touch_time;
      const distance = Math.sqrt(
        Math.pow(touchX - this.last_touch_x, 2) + Math.pow(touchY - this.last_touch_y, 2)
      );

      if (timeDiff < DOUBLE_CLICK_TIMEOUT && distance < DOUBLE_CLICK_DISTANCE) {
        this.touch_count++;
        if (this.touch_count === 2) {
          this.double_tap(e);
          this.touch_count = 0;
          return;
        }
      } else {
        this.touch_count = 1;
      }

      this.last_touch_time = now;
      this.last_touch_x = touchX;
      this.last_touch_y = touchY;
    } else {
      this.touch_count = 0;
      this.last_touch_time = 0;
    }
  };

  private double_tap = (e: TouchEvent) => {
    e.preventDefault();
    this.stop_smooth_move();

    const isNormalScale = this.transform_instance.get_scale() === 1;

    const last_scale = this.transform_instance.get_scale();

    const { translate_x, translate_y} = this.transform_instance.get_translate();

    const rec = this.transform_instance.wrapper_el.getBoundingClientRect();
    const touch = e.changedTouches?.[0] || e.touches?.[0];

    const center_x = touch.clientX - rec.left;
    const center_y = touch.clientY - rec.top;

    const x = isNormalScale ? (translate_x - center_x) * 2 + center_x : (translate_x - center_x) / last_scale + center_x;
    const y = isNormalScale ? (translate_y - center_y) * 2 + center_y : (translate_y - center_y) / last_scale + center_y;

    this.transform_instance.transform({
      translate_x: x,
      translate_y: y,
      scale: isNormalScale ? 2 : 1
    })

    requestAnimationFrame(() => {
      const { translate_x, translate_y } = this.transform_instance.get_translate();
      this.transform_instance.transform(this.transform_instance.constrain_boundary(translate_x, translate_y))
    })

  }

  public addEventListener() {
    this.transform_instance.transform_el.addEventListener('touchstart', this.touch_start);
    this.transform_instance.transform_el.addEventListener('touchmove', this.touch_move);
    this.transform_instance.transform_el.addEventListener('touchend', this.touch_end);
  }

  public removeEventListener() {
    this.transform_instance.transform_el.removeEventListener('touchstart', this.touch_start);
    this.transform_instance.transform_el.removeEventListener('touchmove', this.touch_move);
    this.transform_instance.transform_el.removeEventListener('touchend', this.touch_end);
  }
}
