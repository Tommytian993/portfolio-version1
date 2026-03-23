import { PALETTE } from "../constants";
import { opacityTrickleDown } from "../utils";

/** Fixed card size — same visual footprint as TA / CS3520 card */
export const EXPERIENCE_CARD_WIDTH = 800;
export const EXPERIENCE_CARD_HEIGHT = 300;

const DESC_MAX_CHARS = 520;
const DESC_FONT_SIZE = 22;
const DESC_WIDTH = 730;

function truncateDescription(text) {
  const t = (text || "").trim();
  if (t.length <= DESC_MAX_CHARS) return t;
  return `${t.slice(0, DESC_MAX_CHARS - 3).trim()}...`;
}

export default function makeWorkExperienceCard(k, parent, posVec2, roleData) {
  const card = parent.add([
    k.rect(EXPERIENCE_CARD_WIDTH, EXPERIENCE_CARD_HEIGHT, { radius: 8 }),
    k.area(),
    k.outline(4, k.Color.fromHex(PALETTE.color1)),
    k.pos(posVec2),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.opacity(0),
    k.offscreen({ hide: true, distance: 300 }),
  ]);

  const title = card.add([
    k.text(roleData.title, { font: "ibm-bold", size: 32, width: 760 }),
    k.color(k.Color.fromHex(PALETTE.color1)),
    k.pos(20, 20),
    k.opacity(0),
  ]);

  const history = card.add([
    k.text(
      `${roleData.company.name} — ${roleData.company.startDate} – ${roleData.company.endDate}`,
      {
        font: "ibm-regular",
        size: 20,
        width: 760,
      }
    ),
    k.color(k.Color.fromHex(PALETTE.color1)),
    k.pos(20, 60),
    k.opacity(0),
  ]);

  const description = card.add([
    k.text(truncateDescription(roleData.description), {
      font: "ibm-regular",
      size: DESC_FONT_SIZE,
      width: DESC_WIDTH,
      lineSpacing: 6,
    }),
    k.color(k.Color.fromHex(PALETTE.color1)),
    k.pos(20, 100),
    k.opacity(0),
  ]);

  opacityTrickleDown(card, [title, history, description]);

  return card;
}
