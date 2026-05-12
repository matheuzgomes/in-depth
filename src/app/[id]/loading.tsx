import { T } from "@/lib/tokens"

export default function LoadingGuide() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 3rem" }}>
      <div style={{
        height: 19, width: 130, marginTop: "1.25rem", marginBottom: "1rem",
        borderRadius: 6, background: T.bg2,
      }} />
      <div style={{
        borderRadius: 14, border: `0.5px solid ${T.borderHi}`,
        background: T.bg1, padding: "22px 24px", marginBottom: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: T.bg2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 16, width: 210, borderRadius: 6, background: T.bg2, marginBottom: 10 }} />
            <div style={{ height: 14, width: "85%", borderRadius: 6, background: T.bg2 }} />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ height: 14, borderRadius: 6, background: T.bg2 }} />
        <div style={{ height: 14, width: "92%", borderRadius: 6, background: T.bg2 }} />
        <div style={{ height: 14, width: "76%", borderRadius: 6, background: T.bg2 }} />
      </div>
    </div>
  )
}
