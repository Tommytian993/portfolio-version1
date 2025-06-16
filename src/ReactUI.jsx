import CameraController from "./reactComponents/CameraController";

export default function ReactUI() {
     return(
          <>
          <p className="controls-message">
               "Tap/Click Around to Move"
          </p>
          <CameraController />
          {/* Bring the UI Componenets here */}
          </>
     )
}