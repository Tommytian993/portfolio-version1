import kaplay from "kaplay";
export default function makeKaplayCtx() {
  return kaplay({
    global: false,
    pixelDensity: 1.7, // 降低像素密度以提高性能
    touchToMouse: true,
    debug: false,
    debugKey: "f1",
    canvas: document.getElementById("game"),
    width: window.innerWidth,
    height: window.innerHeight,
  });
}
