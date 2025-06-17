import { PALETTE } from "../constants";
import { emailAtom, isEmailModalVisibleAtom, store } from "../store";
import { opacityTrickleDown } from "../utils";
import makeIcon from "./Icon";

/**
 * 创建邮件图标组件
 *
 * 这个函数用于创建可交互的邮件图标，包含一个触发区域。
 * 当玩家碰到触发区域时，会显示邮件模态框并设置邮件内容。
 * 图标和说明文字会随着距离逐渐显现。
 *
 * @param {Object} k - Kaplay 游戏引擎实例
 * @param {Object} parent - 父级游戏对象
 * @param {Object} posVec2 - 图标位置向量
 * @param {Object} imageData - 图标数据对象
 *   @param {string} imageData.name - 图标精灵名称
 *   @param {number} imageData.width - 图标宽度
 *   @param {number} imageData.height - 图标高度
 * @param {string} subtitle - 图标下方的说明文字
 * @param {string} email - 要显示的邮件地址
 *
 * @returns {Object} 返回邮件图标对象
 */
export default function makeEmailIcon(
  k,
  parent,
  posVec2,
  imageData,
  subtitle,
  email
) {
  // 使用基础图标组件创建图标和说明文字
  const [emailIcon, subtitleText] = makeIcon(
    k,
    parent,
    posVec2,
    imageData,
    subtitle
  );

  // 创建触发区域（一个圆形区域）
  const emailSwitch = emailIcon.add([
    k.circle(30), // 半径为30的圆形
    k.color(k.Color.fromHex(PALETTE.color1)), // 使用主题色
    k.anchor("center"), // 设置锚点在中心
    k.area(), // 添加碰撞区域
    k.pos(0, 150), // 位置在图标下方150像素
    k.opacity(0), // 初始透明
  ]);

  // 当玩家碰到触发区域时
  emailSwitch.onCollide("player", () => {
    store.set(isEmailModalVisibleAtom, true); // 显示邮件模态框
    store.set(emailAtom, email); // 设置邮件内容
  });

  // 应用渐入效果到说明文字和触发区域
  opacityTrickleDown(parent, [subtitleText, emailSwitch]);

  return emailIcon;
}
