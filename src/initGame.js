import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makePlayer from "./entites/Player";
import makeKaplayCtx from "./kaplayCtx";
import {
  cameraZoomValueAtom,
  experienceCategoryAtom,
  pointerOverExperienceToggleAtom,
  pointerOverProjectToggleAtom,
  pointerOverSkillsOptionsAtom,
  projectCategoryAtom,
  skillCategoryAtom,
  store,
} from "./store";
import makeIcon from "./components/Icon";
import { opacityTrickleDown } from "./utils";
import { makeAppear } from "./utils";
import { PerformanceMonitor } from "./utils";
import makeSocialIcon from "./components/SocialIcon";
import makeEmailIcon from "./components/EmailIcon";
import makeWorkExperienceCard, {
  EXPERIENCE_CARD_HEIGHT,
} from "./components/WorkExperience";
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
    k.loadSprite("linkedin-logo", "./logos/linkedin-logo.png"),
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
    k.loadSprite("tohotopia", "./projects/tohotopia.png"),
    k.loadSprite("flameguard-cpp", "./projects/flameguard-cpp.png"),
    k.loadSprite("greenward", "./projects/greenward.png"),
    k.loadSprite("carpoolnu", "./projects/nucarpool.png"),
    k.loadSprite("lumina", "./projects/lumina.png"),
    k.loadSprite("minix-godot", "./projects/minix-godot.png"),
    k.loadSprite("ens", "./projects/ens.png"),
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
  const section2Pos = k.vec2(k.center().x - 400, k.center().y);
  const skillsContainer = k.add([
    k.opacity(0),
    k.pos(section2Pos.x - 300, section2Pos.y),
  ]);
  const skillsEmoji = k.add([
    k.text("🛠️", { font: "ibm-bold", size: 72 }),
    k.anchor("center"),
    k.pos(section2Pos.x, section2Pos.y + 10),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.opacity(0),
  ]);
  let skillsOptionsRoot;
  const skillTags = [
    "Languages",
    "Frontend",
    "Backend",
    "Storage",
    "ML",
    "Agents",
  ];
  const tagBtnW = 128;
  const tagBtnH = 44;
  const tagGap = 10;
  const gridPad = 12;
  skillsOptionsRoot = k.add([
    k.pos(section2Pos.x, section2Pos.y + 190),
    k.anchor("center"),
    k.opacity(0),
  ]);
  const skillsOptionsCenterX = section2Pos.x;
  const skillsOptionsCenterY = section2Pos.y + 190;
  const gridW = tagBtnW * 3 + tagGap * 2 + gridPad * 2;
  const gridH = tagBtnH * 2 + tagGap + gridPad * 2;
  skillsOptionsRoot.add([
    k.rect(gridW, gridH, { radius: 8, fill: false }),
    k.anchor("center"),
    k.pos(0, 0),
    k.outline(3, k.Color.fromHex(PALETTE.color1)),
    k.opacity(0),
  ]);

  const skillTagButtons = [];
  for (let i = 0; i < skillTags.length; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const px = (col - 1) * (tagBtnW + tagGap);
    const py = (row - 0.5) * (tagBtnH + tagGap);
    const label = skillTags[i];
    const btn = skillsOptionsRoot.add([
      k.rect(tagBtnW, tagBtnH, { radius: 6 }),
      k.anchor("center"),
      k.pos(px, py),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    const btnText = btn.add([
      k.text(label, {
        font: "ibm-bold",
        size: 21,
        width: tagBtnW - 8,
        align: "center",
      }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    btn.onClick(() => store.set(skillCategoryAtom, label));
    skillTagButtons.push({ label, btn, btnText });
  }

  const updateSkillTagStyle = () => {
    const selected = store.get(skillCategoryAtom);
    for (const item of skillTagButtons) {
      const active = item.label === selected;
      item.btn.color = k.Color.fromHex(
        active ? PALETTE.color1 : PALETTE.color2
      );
      item.btnText.color = k.Color.fromHex(
        active ? PALETTE.color2 : PALETTE.color1
      );
    }
  };
  updateSkillTagStyle();
  store.sub(skillCategoryAtom, updateSkillTagStyle);
  const skillsHalfW = gridW / 2;
  const skillsHalfH = gridH / 2;
  k.onUpdate(() => {
    const worldMouse = k.toWorld(k.mousePos());
    const over =
      worldMouse.x >= skillsOptionsCenterX - skillsHalfW &&
      worldMouse.x <= skillsOptionsCenterX + skillsHalfW &&
      worldMouse.y >= skillsOptionsCenterY - skillsHalfH &&
      worldMouse.y <= skillsOptionsCenterY + skillsHalfH;
    store.set(pointerOverSkillsOptionsAtom, over);
  });
  makeSection(k, section2Pos, generalData.section2Name, () => {
    for (const skillData of skillsData) {
      makeSkillIcon(
        k,
        skillsContainer,
        k.vec2(skillData.pos.x, skillData.pos.y),
        skillData.logoData,
        skillData.name
      );
    }
    makeAppear(k, skillsContainer);
    makeAppear(k, skillsEmoji);
    makeAppear(k, skillsOptionsRoot).then(() => {
      const setOpacityRecursive = (node, val) => {
        if (node.opacity !== undefined) node.opacity = val;
        if (node.children)
          for (const c of node.children) setOpacityRecursive(c, val);
      };
      setOpacityRecursive(skillsOptionsRoot, 1);
    });
  });

  const section3Pos = k.vec2(k.center().x + 400, k.center().y);
  const experienceContainer = k.add([
    k.opacity(0),
    k.pos(section3Pos.x, section3Pos.y),
  ]);

  const expToggleX = 0;
  const expBtnW = 135;
  const expBtnH = 48;
  const expGap = 14;
  const expFramePad = 12;
  const expToggleCenterX = section3Pos.x + expToggleX;
  const expToggleCenterY = section3Pos.y + 204;

  let experienceOptionsRoot;
  try {
    experienceOptionsRoot = k.add([
      k.pos(expToggleCenterX, expToggleCenterY),
      k.anchor("center"),
      k.opacity(0),
    ]);
    const expFrameW = expBtnW + expFramePad * 2;
    const expFrameH = expBtnH * 2 + expGap + expFramePad * 2;
    experienceOptionsRoot.add([
      k.rect(expFrameW, expFrameH, { radius: 10, fill: false }),
      k.anchor("center"),
      k.pos(0, 0),
      k.outline(4, k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    const engineeringBtn = experienceOptionsRoot.add([
      k.rect(expBtnW, expBtnH, { radius: 8 }),
      k.anchor("center"),
      k.pos(0, -(expBtnH + expGap) / 2),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    engineeringBtn.add([
      k.text("Engineering", {
        font: "ibm-bold",
        size: 21,
        width: expBtnW - 12,
      }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    const eduBtn = experienceOptionsRoot.add([
      k.rect(expBtnW, expBtnH, { radius: 8 }),
      k.anchor("center"),
      k.pos(0, (expBtnH + expGap) / 2),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    eduBtn.add([
      k.text("Educational", {
        font: "ibm-bold",
        size: 21,
        width: expBtnW - 11,
      }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    const engineeringBtnText =
      engineeringBtn.children && engineeringBtn.children[0];
    const eduBtnText = eduBtn.children && eduBtn.children[0];
    const updateExperienceToggleStyle = () => {
      const cat = store.get(experienceCategoryAtom);
      const engineeringActive = cat === "Engineering";
      engineeringBtn.color = k.Color.fromHex(
        engineeringActive ? PALETTE.color1 : PALETTE.color2
      );
      if (engineeringBtnText && "color" in engineeringBtnText)
        engineeringBtnText.color = k.Color.fromHex(
          engineeringActive ? PALETTE.color2 : PALETTE.color1
        );
      const eduActive = cat === "Education";
      eduBtn.color = k.Color.fromHex(
        eduActive ? PALETTE.color1 : PALETTE.color2
      );
      if (eduBtnText && "color" in eduBtnText)
        eduBtnText.color = k.Color.fromHex(
          eduActive ? PALETTE.color2 : PALETTE.color1
        );
    };
    updateExperienceToggleStyle();
    store.sub(experienceCategoryAtom, updateExperienceToggleStyle);
    engineeringBtn.onClick(() =>
      store.set(experienceCategoryAtom, "Engineering")
    );
    eduBtn.onClick(() => store.set(experienceCategoryAtom, "Education"));

    const expToggleHalfW = expFrameW / 2;
    const expToggleHalfH = expFrameH / 2;
    k.onUpdate(() => {
      const worldMouse = k.toWorld(k.mousePos());
      const over =
        worldMouse.x >= expToggleCenterX - expToggleHalfW &&
        worldMouse.x <= expToggleCenterX + expToggleHalfW &&
        worldMouse.y >= expToggleCenterY - expToggleHalfH &&
        worldMouse.y <= expToggleCenterY + expToggleHalfH;
      store.set(pointerOverExperienceToggleAtom, over);
    });
  } catch (expToggleErr) {
    console.warn(
      "Experience toggle failed, continuing without it:",
      expToggleErr
    );
    experienceOptionsRoot = k.add([
      k.pos(section3Pos.x, section3Pos.y + 140),
      k.anchor("center"),
      k.opacity(0),
    ]);
  }

  const EXPERIENCE_SLOT_GAP = 36;
  const EXPERIENCE_CARDS_X = 200;
  const EXPERIENCE_MAX_SLOTS = 4;

  const populateExperienceCards = (makeVisible = false) => {
    while (experienceContainer.children.length > 0) {
      experienceContainer.children[0].destroy();
    }
    const cat = store.get(experienceCategoryAtom);
    const list = experiencesData.filter(
      (e) => (e.category ?? "Engineering") === cat
    );
    const slice = list.slice(0, EXPERIENCE_MAX_SLOTS);
    const stepY = EXPERIENCE_CARD_HEIGHT + EXPERIENCE_SLOT_GAP;
    slice.forEach((entry, i) => {
      makeWorkExperienceCard(
        k,
        experienceContainer,
        k.vec2(EXPERIENCE_CARDS_X, i * stepY),
        entry.roleData
      );
    });
    if (makeVisible) {
      const walk = (node, val) => {
        if (node.opacity !== undefined) node.opacity = val;
        if (node.children) for (const c of node.children) walk(c, val);
      };
      walk(experienceContainer, 1);
    }
  };

  // Section hitbox (dark box) must be added before the emoji so the emoji draws on top — same order as Projects.
  makeSection(k, section3Pos, generalData.section3Name, () => {
    experienceSectionOpened = true;
    populateExperienceCards();
    makeAppear(k, experienceContainer);
    makeAppear(k, experienceEmoji);
    makeAppear(k, experienceOptionsRoot).then(() => {
      const setOpacityRecursive = (node, val) => {
        if (node.opacity !== undefined) node.opacity = val;
        if (node.children)
          for (const c of node.children) setOpacityRecursive(c, val);
      };
      setOpacityRecursive(experienceOptionsRoot, 1);
    });
  });

  const experienceEmoji = k.add([
    k.text(store.get(experienceCategoryAtom) === "Engineering" ? "👨‍🔧" : "👨‍🏫", {
      font: "ibm-bold",
      size: 90,
    }),
    k.anchor("center"),
    k.pos(section3Pos.x, section3Pos.y + 10),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.opacity(0),
  ]);

  let experienceSectionOpened = false;
  store.sub(experienceCategoryAtom, () => {
    const cat = store.get(experienceCategoryAtom);
    experienceEmoji.text = cat === "Engineering" ? "👨‍🔧" : "👨‍🏫";
    if (experienceSectionOpened) populateExperienceCards(true);
  });

  const projectsSectionPos = k.vec2(k.center().x, k.center().y + 400);
  const gamesData = projectsData.filter((p) => p.category === "Games");
  const majorData = projectsData.filter((p) => p.category === "Major");
  const socialGoodData = projectsData.filter((p) => p.category === "Social");

  const containerProjectCards = k.add([
    k.opacity(0),
    k.pos(projectsSectionPos.x, projectsSectionPos.y),
  ]);

  const setOpacityRecursive = (node, val) => {
    if (node.opacity !== undefined) node.opacity = val;
    if (node.children)
      for (const c of node.children) setOpacityRecursive(c, val);
  };
  const populateProjectCards = (makeVisible = false) => {
    while (containerProjectCards.children.length > 0) {
      containerProjectCards.children[0].destroy();
    }
    const cat = store.get(projectCategoryAtom);
    const data =
      cat === "Games"
        ? gamesData
        : cat === "Major"
        ? majorData
        : socialGoodData;
    for (const project of data) {
      makeProjectCard(
        k,
        containerProjectCards,
        k.vec2(project.pos.x, project.pos.y),
        project.data,
        project.thumbnail
      );
    }
    if (makeVisible) setOpacityRecursive(containerProjectCards, 1);
  };

  let projectsSectionOpened = false;
  store.sub(projectCategoryAtom, () => {
    const cat = store.get(projectCategoryAtom);
    projectsEmoji.text = cat === "Games" ? "🎮" : cat === "Major" ? "🧰" : "🤝";
    if (projectsSectionOpened) populateProjectCards(true);
  });

  makeSection(k, projectsSectionPos, generalData.section4Name, () => {
    projectsSectionOpened = true;
    populateProjectCards();
    makeAppear(k, containerProjectCards);
    makeAppear(k, projectsEmoji);
    if (toggleRoot) {
      makeAppear(k, toggleRoot).then(() => {
        const setOpacityRecursive = (node, val) => {
          if (node.opacity !== undefined) node.opacity = val;
          if (node.children)
            for (const c of node.children) setOpacityRecursive(c, val);
        };
        setOpacityRecursive(toggleRoot, 1);
      });
    }
  });

  const projectsEmoji = k.add([
    k.text(store.get(projectCategoryAtom) === "Games" ? "🎮" : "🧰", {
      font: "ibm-bold",
      size: 90,
    }),
    k.anchor("center"),
    k.pos(projectsSectionPos.x, projectsSectionPos.y + 10),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.opacity(0),
  ]);

  let toggleRoot;
  try {
    const toggleX = 220;
    const btnW = 96;
    const btnH = 48;
    const gap = 14;
    const framePad = 12;
    toggleRoot = k.add([
      k.pos(projectsSectionPos.x + toggleX, projectsSectionPos.y),
      k.anchor("center"),
      k.opacity(0),
    ]);
    const frameW = btnW + framePad * 2;
    const frameH = btnH * 3 + gap * 2 + framePad * 2;
    toggleRoot.add([
      k.rect(frameW, frameH, { radius: 10, fill: false }),
      k.anchor("center"),
      k.pos(0, 0),
      k.outline(4, k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    const gamesBtn = toggleRoot.add([
      k.rect(btnW, btnH, { radius: 8 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    gamesBtn.add([
      k.text("Games", { font: "ibm-bold", size: 24 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    const majorBtn = toggleRoot.add([
      k.rect(btnW, btnH, { radius: 8 }),
      k.anchor("center"),
      k.pos(0, -(btnH + gap)),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    majorBtn.add([
      k.text("Major", { font: "ibm-bold", size: 24 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    const socialBtn = toggleRoot.add([
      k.rect(btnW, btnH, { radius: 8 }),
      k.anchor("center"),
      k.pos(0, btnH + gap),
      k.area(),
      k.color(k.Color.fromHex(PALETTE.color2)),
      k.opacity(0),
    ]);
    socialBtn.add([
      k.text("Social", { font: "ibm-bold", size: 24 }),
      k.anchor("center"),
      k.pos(0, 0),
      k.color(k.Color.fromHex(PALETTE.color1)),
      k.opacity(0),
    ]);
    const gamesBtnText = gamesBtn.children && gamesBtn.children[0];
    const majorBtnText = majorBtn.children && majorBtn.children[0];
    const socialBtnText = socialBtn.children && socialBtn.children[0];
    const updateToggleStyle = () => {
      const cat = store.get(projectCategoryAtom);
      const gamesActive = cat === "Games";
      gamesBtn.color = k.Color.fromHex(
        gamesActive ? PALETTE.color1 : PALETTE.color2
      );
      if (gamesBtnText && "color" in gamesBtnText)
        gamesBtnText.color = k.Color.fromHex(
          gamesActive ? PALETTE.color2 : PALETTE.color1
        );
      const majorActive = cat === "Major";
      majorBtn.color = k.Color.fromHex(
        majorActive ? PALETTE.color1 : PALETTE.color2
      );
      if (majorBtnText && "color" in majorBtnText)
        majorBtnText.color = k.Color.fromHex(
          majorActive ? PALETTE.color2 : PALETTE.color1
        );
      const socialActive = cat === "Social";
      socialBtn.color = k.Color.fromHex(
        socialActive ? PALETTE.color1 : PALETTE.color2
      );
      if (socialBtnText && "color" in socialBtnText)
        socialBtnText.color = k.Color.fromHex(
          socialActive ? PALETTE.color2 : PALETTE.color1
        );
    };
    updateToggleStyle();
    store.sub(projectCategoryAtom, updateToggleStyle);
    gamesBtn.onClick(() => store.set(projectCategoryAtom, "Games"));
    majorBtn.onClick(() => store.set(projectCategoryAtom, "Major"));
    socialBtn.onClick(() => store.set(projectCategoryAtom, "Social"));

    const toggleHalfW = frameW / 2;
    const toggleHalfH = frameH / 2;
    const toggleCenterX = projectsSectionPos.x + toggleX;
    const toggleCenterY = projectsSectionPos.y;
    k.onUpdate(() => {
      const worldMouse = k.toWorld(k.mousePos());
      const over =
        worldMouse.x >= toggleCenterX - toggleHalfW &&
        worldMouse.x <= toggleCenterX + toggleHalfW &&
        worldMouse.y >= toggleCenterY - toggleHalfH &&
        worldMouse.y <= toggleCenterY + toggleHalfH;
      store.set(pointerOverProjectToggleAtom, over);
    });
  } catch (toggleErr) {
    console.warn("Projects toggle failed, continuing without it:", toggleErr);
  }

  const player = makePlayer(k, k.vec2(k.center().x, k.center().y), 700);
  k.camPos(player.pos);
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
