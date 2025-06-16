import { PALETTE } from "../constants";

/**
 * 创建游戏中的图标组件
 *
 * 这个函数用于创建游戏中的可交互图标，包括图标本身和下方的说明文字。
 * 图标会在距离玩家一定距离时自动隐藏，并且支持淡入淡出效果。
 *
 * @param {Object} k - Kaplay 游戏引擎实例
 * @param {Object} parent - 父级游戏对象
 * @param {Object} posVec2 - 图标位置向量
 * @param {Object} imageData - 图标数据对象
 *   @param {string} imageData.name - 图标精灵名称
 *   @param {number} imageData.width - 图标宽度
 *   @param {number} imageData.height - 图标高度
 * @param {string} subtitle - 图标下方的说明文字
 *
 * @returns {Array} 返回一个包含两个元素的数组：
 *   - 第一个元素是图标对象
 *   - 第二个元素是说明文字对象
 */
export default function makeIcon(k, parent, posVec2, imageData, subtitle) {
  // 创建图标精灵
  const icon = parent.add([
    k.sprite(imageData.name, {
      width: imageData.width,
      height: imageData.height,
    }),
    k.anchor("center"), // 设置锚点在中心
    k.pos(posVec2), // 设置位置
    k.opacity(0), // 初始透明度为0
    k.offscreen({ hide: true, distance: 300 }), // 超出屏幕300像素时隐藏
  ]);

  // 创建说明文字
  const subtitleText = icon.add([
    k.text(subtitle, { font: "ibm-bold", size: 32 }), // 使用IBM字体，32号大小
    k.color(k.Color.fromHex(PALETTE.color1)), // 设置文字颜色
    k.anchor("center"), // 文字锚点在中心
    k.pos(0, 100), // 文字位置在图标下方100像素
    k.opacity(0), // 初始透明度为0
  ]);

  return [icon, subtitleText];
}
