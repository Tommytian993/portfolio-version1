import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makePlayer from "./entites/Player";
import makeKaplayCtx from "./kaplayCtx";
import { cameraZoomValueAtom, store } from "./store";
import makeIcon from "Icon";
import { opacityTrickleDown } from "../utils";

export default async function initGame() {
  const generalData = await (await fetch("./configs/generalData.json")).json();
  const skillsData = await (await fetch("./configs/skillsData.json")).json();
  const socialsData = await (await fetch("./configs/socialsData.json")).json();
  const experiencesData = await (
    await fetch("./configs/experiencesData.json")
  ).json();
  const projectsData = await (
    await fetch("./configs/projectsData.json")
  ).json();

  const k = makeKaplayCtx();

  // 预加载所有资源
  await Promise.all([
    k.loadSprite("player", "./sprites/player.png", {
      sliceX: 4,
      sliceY: 8,
      anims: {
        "walk-down-idle": 0,
        "walk-down": { from: 0, to: 3, loop: true },
        "walk-left-down": { from: 4, to: 7, loop: true },
        "walk-left-down-idle": 4,
        "walk-left": { from: 8, to: 11, loop: true },
        "walk-left-idle": 8,
        "walk-left-up": { from: 12, to: 15, loop: true },
        "walk-left-up-idle": 12,
        "walk-up": { from: 16, to: 19, loop: true },
        "walk-up-idle": 16,
        "walk-right-up": { from: 20, to: 23, loop: true },
        "walk-right-up-idle": 20,
        "walk-right": { from: 24, to: 27, loop: true },
        "walk-right-idle": 24,
        "walk-right-down": { from: 28, to: 31, loop: true },
        "walk-right-down-idle": 28,
      },
    }),
    k.loadSprite("github-logo", "./logos/github-logo.png"),
    k.loadSprite("linkedin-logo", "./logos/linkedin-logo.png"),
    k.loadSprite("youtube-logo", "./logos/youtube-logo.png"),
    k.loadSprite("x-logo", "./logos/x-logo.png"),
    k.loadSprite("substack-logo", "./logos/substack-logo.png"),
    k.loadSprite("javascript-logo", "./logos/js-logo.png"),
    k.loadSprite("typescript-logo", "./logos/ts-logo.png"),
    k.loadSprite("react-logo", "./logos/react-logo.png"),
    k.loadSprite("nextjs-logo", "./logos/nextjs-logo.png"),
    k.loadSprite("postgres-logo", "./logos/postgres-logo.png"),
    k.loadSprite("html-logo", "./logos/html-logo.png"),
    k.loadSprite("css-logo", "./logos/css-logo.png"),
    k.loadSprite("tailwind-logo", "./logos/tailwind-logo.png"),
    k.loadSprite("python-logo", "./logos/python-logo.png"),
    k.loadSprite("email-logo", "./logos/email-logo.png"),
    k.loadSprite("sonic-js", "./projects/sonic-js.png"),
    k.loadSprite("kirby-ts", "./projects/kirby-ts.png"),
    k.loadSprite("platformer-js", "./projects/platformer-js.png"),
    k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag"),
  ]);

  const setInitCamZoomValue = () => {
    const scale = k.width() < 1000 ? 0.5 : 0.8;
    console.log("Initial camera scale:", scale);
    k.camScale(k.vec2(scale));
    store.set(cameraZoomValueAtom, scale);
  };
  setInitCamZoomValue();

  // 只在窗口大小改变时更新相机缩放
  k.onResize(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    console.log("Camera zoom value on resize:", cameraZoomValue);
    console.log("Current camera scale:", k.camScale().x);
    if (cameraZoomValue !== k.camScale().x) {
      console.log("Updating camera scale to:", cameraZoomValue);
      k.camScale(k.vec2(cameraZoomValue));
    }
  });

  // 添加一个更新监听器
  k.onUpdate(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    if (cameraZoomValue !== k.camScale().x) {
      console.log("Updating camera scale in onUpdate:", cameraZoomValue);
      k.camScale(k.vec2(cameraZoomValue));
    }
  });

  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 20,
      u_color1: k.Color.fromHex(PALETTE.color3),
      u_color2: k.Color.fromHex(PALETTE.color2),
      u_speed: k.vec2(1, -1),
      u_aspect: k.width() / k.height(),
      u_size: 5,
    })),
    k.pos(0, 0),
    k.fixed(),
  ]);

  // 只在窗口大小改变时更新背景
  k.onResize(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });

  makePlayer(k, k.vec2(k.center()), 700);

  makeSection(k, k.vec2(k.center().x, k.center().y + 100), "Home", () => {
    console.log("Home");
  });
}

/**
 * 创建技能图标组件
 *
 * 这个函数用于创建可交互的技能图标，具有物理效果和碰撞检测。
 * 当玩家碰到图标时，图标会被推开，并且会继承玩家的移动方向。
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
 *
 * @returns {Object} 返回技能图标对象
 */
export function makeSkillIcon(k, parent, posVec2, imageData, subtitle) {
  // 使用基础图标组件创建图标和说明文字
  const [icon, subtitleText] = makeIcon(
    k,
    parent,
    posVec2,
    imageData,
    subtitle
  );

  // 添加碰撞区域，比图标本身稍大一些
  icon.use(
    k.area({ shape: new k.Rect(k.vec2(0), icon.width + 50, icon.height + 65) })
  );

  // 添加物理属性，使图标可以被推动
  icon.use(k.body({ drag: 1 }));

  // 初始化移动方向
  icon.use({ direction: k.vec2(0, 0) });

  // 当与玩家碰撞时，图标会被推开
  icon.onCollide("player", (player) => {
    icon.applyImpulse(player.direction.scale(1000)); // 施加冲量
    icon.direction = player.direction; // 继承玩家方向
  });

  // 应用渐入效果
  opacityTrickleDown(parent, [subtitleText]);

  return icon;
}
