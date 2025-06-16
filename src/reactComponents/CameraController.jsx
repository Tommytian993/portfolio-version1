import { useAtom } from "jotai";
import { cameraZoomValueAtom } from "../store";
import { ZOOM_MAX_BOUND, ZOOM_MIN_BOUND } from "../constants";

export default function CameraController() {
  const [camZoomValue, setCamZoomValue] = useAtom(cameraZoomValueAtom);
  console.log("Current camera zoom value:", camZoomValue);

  return (
    <div className="camera-controller">
      <button
        className="camera-controller-btn"
        onClick={() => {
          const newZoomValue = camZoomValue + 0.2;
          console.log("Zoom in - New value:", newZoomValue);
          if (newZoomValue <= ZOOM_MAX_BOUND && newZoomValue >= ZOOM_MIN_BOUND) {
            setCamZoomValue(newZoomValue);
            console.log("Zoom in - Value set to:", newZoomValue);
          }
        }}
      >
        +
      </button>
      <button
        className="camera-controller-btn"
        onClick={() => {
          const newZoomValue = camZoomValue - 0.2;
          console.log("Zoom out - New value:", newZoomValue);
          if (newZoomValue <= ZOOM_MAX_BOUND && newZoomValue >= ZOOM_MIN_BOUND) {
            setCamZoomValue(newZoomValue);
            console.log("Zoom out - Value set to:", newZoomValue);
          }
        }}
      >
        -
      </button>
    </div>
  );
}