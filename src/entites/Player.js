import { DIAGONAL_FACTOR } from "../constants";
import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  store,
} from "../store";

export default function makePlayer(k, posVec2, speed) {
  const player = k.add([
    k.sprite("player", { anim: "walk-down" }),
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
    k.body(),
    k.pos(posVec2),
    "player",
    {
      direction: k.vec2(0, 0),
      directionName: "walk-down",
    },
  ]);

  let isMouseDown = false;
  const game = document.getElementById("game");

  // 优化事件监听器
  const handleMouseDown = () => {
    isMouseDown = true;
  };
  const handleMouseUp = () => {
    isMouseDown = false;
  };

  game.addEventListener("focusout", handleMouseUp);
  game.addEventListener("mousedown", handleMouseDown);
  game.addEventListener("mouseup", handleMouseUp);
  game.addEventListener("touchstart", handleMouseDown);
  game.addEventListener("touchend", handleMouseUp);

  // 缓存模态框状态，避免重复获取
  let modalStates = {
    social: false,
    email: false,
    project: false,
  };

  // 监听模态框状态变化
  store.sub(isSocialModalVisibleAtom, (value) => {
    modalStates.social = value;
  });
  store.sub(isEmailModalVisibleAtom, (value) => {
    modalStates.email = value;
  });
  store.sub(isProjectModalVisibleAtom, (value) => {
    modalStates.project = value;
  });

  player.onUpdate(() => {
    // 相机跟随优化
    if (!k.camPos().eq(player.pos)) {
      k.tween(
        k.camPos(),
        player.pos,
        0.2,
        (newPos) => k.camPos(newPos),
        k.easings.linear
      );
    }

    // 检查模态框状态，如果有任何模态框打开则停止玩家移动
    if (modalStates.social || modalStates.email || modalStates.project) {
      return;
    }

    player.direction = k.vec2(0, 0);
    const worldMousePos = k.toWorld(k.mousePos());

    if (isMouseDown) {
      player.direction = worldMousePos.sub(player.pos).unit();
    }

    // 优化动画状态检查
    const currentAnim = player.getCurAnim().name;
    const isIdle = currentAnim.includes("idle");

    if (player.direction.eq(k.vec2(0, 0)) && !isIdle) {
      player.play(`${player.directionName}-idle`);
      return;
    }

    // 优化方向判断逻辑
    const { x, y } = player.direction;
    let newDirectionName = player.directionName;

    if (x > 0 && y > -0.5 && y < 0.5) {
      newDirectionName = "walk-right";
    } else if (x < 0 && y > -0.5 && y < 0.5) {
      newDirectionName = "walk-left";
    } else if (x < 0 && y < -0.8) {
      newDirectionName = "walk-up";
    } else if (x < 0 && y > 0.8) {
      newDirectionName = "walk-down";
    } else if (x < 0 && y > -0.8 && y < -0.5) {
      newDirectionName = "walk-left-up";
    } else if (x < 0 && y > 0.5 && y < 0.8) {
      newDirectionName = "walk-left-down";
    } else if (x > 0 && y < -0.5 && y > -0.8) {
      newDirectionName = "walk-right-up";
    } else if (x > 0 && y > 0.5 && y < 0.8) {
      newDirectionName = "walk-right-down";
    }

    if (newDirectionName !== player.directionName) {
      player.directionName = newDirectionName;
      if (currentAnim !== newDirectionName) {
        player.play(newDirectionName);
      }
    }

    // 移动逻辑优化
    if (x && y) {
      player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
    } else {
      player.move(player.direction.scale(speed));
    }
  });

  return player;
}
