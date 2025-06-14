import kaplay from "kaplay";
export default function makeKaplayCtx() {
  return kaplay({
    global: false,
    pixelDensity: 1,
    touchToMouse: true,
    debug: false,
    debugKey: "f1",
    canvas: document.getElementById("game"),
    width: window.innerWidth,
    height: window.innerHeight,
  });
}
