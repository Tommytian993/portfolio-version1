import { atom, createStore } from "jotai";

export const isSocialModalVisibleAtom = atom(false);
export const selectedLinkAtom = atom(null);
export const selectedLinkDescriptionAtom = atom("");

export const isEmailModalVisibleAtom = atom(false);
export const emailAtom = atom("");

export const isProjectModalVisibleAtom = atom(false);
export const chosenProjectDataAtom = atom({
  title: "",
  links: [{ id: 0, name: "", link: "" }],
});
export const projectCategoryAtom = atom("Games"); // "Games" | "Major" | "Social"
export const pointerOverProjectToggleAtom = atom(false);
export const pointerOverExperienceToggleAtom = atom(false);
export const pointerOverSkillsOptionsAtom = atom(false);
export const skillCategoryAtom = atom("Languages"); // selectable UI only
export const experienceCategoryAtom = atom("Engineering"); // "Engineering" | "Education"

export const cameraZoomValueAtom = atom(1);

export const store = createStore();
