// Made-up extensions for the fake toolbar: plain black-and-white glyphs, not
// anyone's logo. They're pictures only: not buttons.
const svg = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, "aria-hidden": true } as const;

export const GLYPHS = [
  {
    name: "Shield",
    icon: (
      <svg {...svg}>
        <path d="M8 1.8 13 3.6v4.2c0 3-2.2 5.2-5 6.4-2.8-1.2-5-3.4-5-6.4V3.6z" />
      </svg>
    ),
  },
  {
    name: "Notes",
    icon: (
      <svg {...svg}>
        <rect x="3" y="2" width="10" height="12" />
        <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
      </svg>
    ),
  },
  {
    name: "Timer",
    icon: (
      <svg {...svg}>
        <circle cx="8" cy="9" r="5" />
        <path d="M8 9V6.5M6.5 2h3" />
      </svg>
    ),
  },
  {
    name: "Bookmark",
    icon: (
      <svg {...svg}>
        <path d="M4 2h8v12l-4-3-4 3z" />
      </svg>
    ),
  },
  {
    name: "Code",
    icon: (
      <svg {...svg}>
        <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" />
      </svg>
    ),
  },
  {
    name: "Picker",
    icon: (
      <svg {...svg}>
        <rect x="2.5" y="2.5" width="11" height="11" />
        <path d="M2.5 8h11M8 2.5v11" />
      </svg>
    ),
  },
];
