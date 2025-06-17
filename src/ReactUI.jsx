import CameraController from "./reactComponents/CameraController";
import SocialsModal from "./reactComponents/SocialModal";
import EmailModal from "./reactComponents/EmailModal";
import ProjectModal from "./reactComponents/ProjectModal";

export default function ReactUI() {
     return(
          <>
          <p className="controls-message">
               "Tap/Click Around to Move"
          </p>
          <CameraController />
          {/* Bring the UI Componenets here */}
          <SocialsModal />
          <EmailModal />
          <ProjectModal />
          </>
     )
}