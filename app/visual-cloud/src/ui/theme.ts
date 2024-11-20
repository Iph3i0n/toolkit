export const Theme = Object.freeze({
  Info: "#8ecae6",
  Primary: "#219ebc",
  Secondary: "#023047",
  SecondaryOffset: "#fff",
  OffsetLight: "#ffb703",
  OffsetDark: "#fb8500",
  BackgroundBody: "#f5f8fa",
  BackgroundHighlight: "#dfe3e6",
});

export const Font = Object.freeze({
  Body: {
    fontFamily: "monospace",
    fontSize: 16,
  },
});

export function FontWidth(name: keyof typeof Font) {
  return Font[name].fontSize * 0.65;
}

export function FontHeight(name: keyof typeof Font) {
  return Font[name].fontSize;
}

export const Padding = Object.freeze({
  Body: 4,
});

export const Border = Object.freeze({
  Body: Object.freeze({
    stroke: Theme.Primary,
    strokeWidth: 2,
    cornerRadius: 2,
  }),
  Highlight: Object.freeze({
    stroke: Theme.Secondary,
    strokeWidth: 2,
    cornerRadius: 10,
  }),
});

export const Shadow = Object.freeze({
  Body: Object.freeze({
    shadowBlur: 10,
    shadowColor: "black",
    shadowOpacity: 0.75,
    shadowOffset: { x: 0, y: 0 },
  }),
});
