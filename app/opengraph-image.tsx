import { ImageResponse } from "next/og";
export const alt =
  "Musfiquer Rhman — Full-stack developer. Thoughtful code. Real-world impact.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#101210",
        color: "#f1f3eb",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "70px 80px",
        fontFamily: "sans-serif",
        borderBottom: "12px solid #b1f359",
      }}
    >
      <div
        style={{
          display: "flex",
          color: "#b1f359",
          fontSize: 24,
          marginBottom: 65,
        }}
      >
        HELLO, WORLD. I’M MUSFIQUER.
      </div>
      <div style={{ fontSize: 78, fontWeight: 700, display: "flex" }}>
        Thoughtful code.
      </div>
      <div
        style={{
          fontSize: 78,
          fontWeight: 700,
          color: "#b1f359",
          display: "flex",
        }}
      >
        Real-world impact.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          marginTop: 60,
          color: "#a6afa0",
        }}
      >
        Musfiquer Rhman / Full-stack Developer / Dhaka, Bangladesh
      </div>
    </div>,
    size,
  );
}
