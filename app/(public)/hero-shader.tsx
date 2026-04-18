"use client";

import { Dithering } from "@paper-design/shaders-react";

export function HeroShader({
  variant = "default",
}: {
  variant?: "default" | "small";
}) {
  if (variant === "small") {
    return (
      <Dithering
        speed={1}
        shape="simplex"
        type="4x4"
        size={2}
        scale={0.5}
        colorBack="#00000000"
        colorFront="#F4F4F2"
        className="h-48 w-96 shrink-0 rounded-lg"
      />
    );
  }

  return (
    <Dithering
      speed={1}
      shape="simplex"
      type="4x4"
      size={2}
      scale={0.5}
      colorBack="#00000000"
      colorFront="#111114"
      className="h-[30%] min-h-32 w-full max-h-48"
    />
  );
}
