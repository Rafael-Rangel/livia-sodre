import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(165deg, #3d2c24 0%, #2c1f1a 55%, #1f1612 100%)",
            boxShadow: "inset 0 0 0 3px rgba(212,184,150,0.45)",
            color: "#d4b896",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}
        >
          LS
        </div>
      </div>
    ),
    { ...size },
  );
}
