import { useAtomValue, useAtom } from "jotai";
import { isProjectModalVisibleAtom, chosenProjectDataAtom } from "../store";

export default function ProjectModal() {
  const projectData = useAtomValue(chosenProjectDataAtom);
  const [isVisible, setIsVisible] = useAtom(isProjectModalVisibleAtom);

  const isVideoDirect = projectData.embedVideo?.match(/\.(mp4|webm|ogg)(\?|$)/i);
  const hasEmbed = !!projectData.embedVideo;

  return (
    isVisible && (
      <div className="modal">
        <div className="modal-content">
          <h1>{projectData.title}</h1>
          {hasEmbed && (
            <div className="modal-video-wrap">
              {isVideoDirect ? (
                <video
                  className="modal-video"
                  src={projectData.embedVideo}
                  controls
                  playsInline
                />
              ) : (
                <iframe
                  className="modal-video"
                  src={projectData.embedVideo}
                  title="Project demo video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}
          <div className="modal-btn-container">
            {projectData.links.map((linkData) => (
              <button
                key={linkData.id}
                className={"modal-btn"}
                onClick={() => {
                  window.open(linkData.link, "_blank");
                }}
              >
                {linkData.name}
              </button>
            ))}
            <button
              className={"modal-btn"}
              onClick={() => {
                setIsVisible(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
}