import React from "react";

export function UseHover() {
  const [hovering, set_hovering] = React.useState(false);

  return {
    hovering,
    props: {
      onMouseEnter: () => set_hovering(true),
      onMouseLeave: () => set_hovering(false),
    },
  };
}
