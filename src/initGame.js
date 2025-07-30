import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makePlayer from "./entites/Player";
import makeKaplayCtx from "./kaplayCtx";
import { cameraZoomValueAtom, store } from "./store";
import makeIcon from "./components/Icon";
import { opacityTrickleDown } from "./utils";
import { makeAppear } from "./utils";
import { PerformanceMonitor } from "./utils";
import makeSocialIcon from "./components/SocialIcon";
import makeEmailIcon from "./components/EmailIcon";
import makeWorkExperienceCard from "./components/WorkExperience";
import makeProjectCard from "./components/ProjectCard";

export default async function initGame() {
  // 初始化性能监控
  const performanceMonitor = new PerformanceMonitor();
  performanceMonitor.start();

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

  // 添加性能监控到游戏循环
  k.onUpdate(() => {
    performanceMonitor.update();
  });

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
    k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf"),
    k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf"),
    k.loadSprite("github-logo", "./logos/github-logo.png"),
    k.loadSprite("zhihu-logo", "./logos/zhihu-logo.png"),
    k.loadSprite("sdl2-logo", "./logos/sdl2-logo.png"),
    k.loadSprite("csharp-logo", "./logos/csharp-logo.png"),
    k.loadSprite("java-logo", "./logos/java-logo.png"),
    k.loadSprite("mysql-logo", "./logos/mysql-logo.png"),
    k.loadSprite("mongodb-logo", "./logos/mongodb-logo.png"),
    k.loadSprite("cpp-logo", "./logos/cpp-logo.png"),
    k.loadSprite("react-logo", "./logos/react-logo.png"),
    k.loadSprite("godot-logo", "./logos/godot-logo.png"),
    k.loadSprite("python2-logo", "./logos/python2-logo.png"),
    k.loadSprite("email-logo", "./logos/email-logo.png"),
    k.loadSprite("flameguard-cpp", "./projects/flameguard-cpp.png"),
    k.loadSprite("kanbas-mern", "./projects/kanbas-mern.png"),
    k.loadSprite("minix-godot", "./projects/minix-godot.png"),
    k.loadSprite("agritrack-angular", "./projects/agritrack-angular.png"),
    k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag"),
  ]);

  const setInitCamZoomValue = () => {
    const scale = k.width() < 1000 ? 0.2 : 0.5;
    k.camScale(k.vec2(scale));
    store.set(cameraZoomValueAtom, scale);
  };
  setInitCamZoomValue();

  // 优化相机缩放更新逻辑
  let lastCameraZoomValue = store.get(cameraZoomValueAtom);
  k.onResize(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    if (cameraZoomValue !== lastCameraZoomValue) {
      k.camScale(k.vec2(cameraZoomValue));
      lastCameraZoomValue = cameraZoomValue;
    }
  });

  // 移除频繁的onUpdate检查，改为在store变化时更新
  store.sub(cameraZoomValueAtom, (newValue) => {
    if (newValue !== lastCameraZoomValue) {
      k.camScale(k.vec2(newValue));
      lastCameraZoomValue = newValue;
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

  // 优化背景更新
  k.onResize(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });

  //makePlayer(k, k.vec2(k.center()), 700);
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y - 400),
    generalData.section1Name,
    (parent) => {
      const container = parent.add([k.pos(-805, -700), k.opacity(0)]);

      container.add([
        k.text(generalData.header.title, { font: "ibm-bold", size: 88 }),
        k.color(k.Color.fromHex(PALETTE.color1)),
        k.pos(260, 0),
        k.opacity(0),
      ]);

      container.add([
        k.text(generalData.header.subtitle, {
          font: "ibm-bold",
          size: 48,
        }),
        k.color(k.Color.fromHex(PALETTE.color1)),
        k.pos(415, 100),
        k.opacity(0),
      ]);

      const socialContainer = container.add([k.pos(130, 0), k.opacity(0)]);

      for (const socialData of socialsData) {
        if (socialData.name === "Email") {
          makeEmailIcon(
            k,
            socialContainer,
            k.vec2(socialData.pos.x, socialData.pos.y),
            socialData.logoData,
            socialData.name,
            socialData.address
          );
          continue;
        }

        makeSocialIcon(
          k,
          socialContainer,
          k.vec2(socialData.pos.x, socialData.pos.y),
          socialData.logoData,
          socialData.name,
          socialData.link,
          socialData.description
        );
      }

      makeAppear(k, container);
      makeAppear(k, socialContainer);
    }
  );
  makeSection(
    k,
    k.vec2(k.center().x - 400, k.center().y),
    generalData.section2Name,
    (parent) => {
      /* make the container independent of the section
       so that the skill icons appear on top of every section's children.
       so that when the skill icons are pushed around by the player
       they always remain on top */
      const container = k.add([
        k.opacity(0),
        k.pos(parent.pos.x - 300, parent.pos.y),
      ]);

      for (const skillData of skillsData) {
        makeSkillIcon(
          k,
          container,
          k.vec2(skillData.pos.x, skillData.pos.y),
          skillData.logoData,
          skillData.name
        );
      }

      makeAppear(k, container);
    }
  );
  makeSection(
    k,
    k.vec2(k.center().x + 400, k.center().y),
    generalData.section3Name,
    (parent) => {
      const container = parent.add([k.opacity(0), k.pos(0)]);
      for (const experienceData of experiencesData) {
        makeWorkExperienceCard(
          k,
          container,
          k.vec2(experienceData.pos.x, experienceData.pos.y),
          experienceData.cardHeight,
          experienceData.roleData
        );
      }

      makeAppear(k, container);
    }
  );
  makeSection(
    k,
    k.vec2(k.center().x, k.center().y + 400),
    generalData.section4Name,
    (parent) => {
      const container = parent.add([k.opacity(0), k.pos(0, 0)]);

      for (const project of projectsData) {
        makeProjectCard(
          k,
          container,
          k.vec2(project.pos.x, project.pos.y),
          project.data,
          project.thumbnail
        );
      }

      makeAppear(k, container);
    }
  );

  makePlayer(k, k.vec2(k.center()), 700);
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
