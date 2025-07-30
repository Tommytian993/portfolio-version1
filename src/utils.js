/**
 * 工具函数集合
 * 提供游戏中常用的动画和视觉效果相关的工具函数
 */

/**
 * 使游戏对象逐渐显现
 *
 * 使用补间动画让游戏对象及其子对象逐渐变得可见。
 * 如果对象有透明度继承效果，会在显现完成后取消。
 *
 * @param {Object} k - Kaplay 游戏引擎实例
 * @param {Object} gameObj - 要显现的游戏对象
 * @returns {Promise} 动画完成后的 Promise
 */
export async function makeAppear(k, gameObj) {
  await k.tween(
    gameObj.opacity, // 起始透明度
    1, // 目标透明度
    0.5, // 动画持续时间（秒）
    (val) => {
      gameObj.opacity = val;
      // 同步更新所有子对象的透明度
      for (const child of gameObj.children) {
        child.opacity = gameObj.opacity;
      }
    },
    k.easings.linear // 使用线性缓动效果
  );

  // 如果对象有透明度继承效果，在显现完成后取消
  if (gameObj.opacityTrickleDown) gameObj.opacityTrickleDown.cancel();
}

/**
 * 设置透明度继承效果
 *
 * 让父对象的透明度变化自动同步到指定的子对象。
 * 用于实现子对象跟随父对象透明度变化的效果。
 *
 * @param {Object} parent - 父游戏对象
 * @param {Array} indirectChildren - 需要继承透明度的子对象数组
 */
export function opacityTrickleDown(parent, indirectChildren) {
  // 在父对象上注册更新监听器
  parent.opacityTrickleDown = parent.onUpdate(() => {
    // 同步更新所有指定子对象的透明度
    for (const indirectChild of indirectChildren) {
      indirectChild.opacity = parent.opacity;
    }
  });
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
    };
    this.frameCount = 0;
    this.lastTime = performance.now();
  }

  start() {
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  update() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime - this.lastTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.metrics.frameTime = 1000 / this.frameCount;
      this.metrics.memoryUsage = performance.memory
        ? performance.memory.usedJSHeapSize / 1024 / 1024
        : 0;

      console.log(
        `Performance: FPS=${
          this.metrics.fps
        }, FrameTime=${this.metrics.frameTime.toFixed(
          2
        )}ms, Memory=${this.metrics.memoryUsage.toFixed(2)}MB`
      );

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

/**
 * 防抖函数，用于优化频繁调用的函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数，用于限制函数调用频率
 */
export function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
