import type { TouchCenter } from './types';

/**
 * 计算两点间距离
 */
export const getDistance = (touches: TouchList): number => {
  const dx = touches[1].clientX - touches[0].clientX;
  const dy = touches[1].clientY - touches[0].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 获取触摸中心点
 */
export const getTouchCenter = (touches: TouchList): TouchCenter => {
  return {
    x: (touches[0].clientX + touches[1].clientX) * 0.5,
    y: (touches[0].clientY + touches[1].clientY) * 0.5
  };
};
