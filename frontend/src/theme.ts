import { createTheme } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

// Main brand color: mint green (index 5 is the base: #47DC9A)
const brand: MantineColorsTuple = [
  "#E8FFF4",
  "#C7FAE2",
  "#9FF3CC",
  "#79EBB7",
  "#5BE4A8",
  "#47DC9A",
  "#33C885",
  "#26A56C",
  "#1B8456",
  "#126040"
];

// Dark colors with a little green in them. dark.7 is the page background.
const dark: MantineColorsTuple = [
  "#E9F0EC",
  "#C3CFC9",
  "#8FA099",
  "#6F8179",
  "#2B3631",
  "#232D29",
  "#18211D",
  "#0A0E0C",
  "#070A09",
  "#050807"
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 5, dark: 5 },
  autoContrast: true,
  luminanceThreshold: 0.35,
  colors: { brand, dark },
  black: "#050807",
  fontFamily: 'Figtree, system-ui, -apple-system, "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Bricolage Grotesque", Figtree, system-ui, sans-serif',
    fontWeight: "700"
  },
  defaultRadius: "md",
  components: {
    Paper: {
      defaultProps: { withBorder: true, radius: "lg" }
    },
    Button: {
      defaultProps: { fw: 600 }
    },
    Badge: {
      defaultProps: { radius: "sm", tt: "none", fw: 600 }
    },
    Table: {
      defaultProps: { verticalSpacing: "sm" }
    }
  }
});

// Color tokens that we also use in inline styles
export const BG = "#0A0E0C";
export const SURFACE = "#111816";
export const SURFACE_RAISED = "#18211D";
export const LINE = "#232D29";
export const MINT = "#47DC9A";
export const MUTED = "#8FA099";

// The dark sidebar and the dark panels
export const NAVY = "#0D1311";
export const NAVY_RAISED = "#1A2420";

// "Glass": a dark see-through panel with a thin light border
export const GLASS = {
  background: "rgba(20, 28, 25, 0.78)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)"
} as const;
