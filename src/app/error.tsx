"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "Pretendard, sans-serif",
        color: "#212121",
        gap: "16px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>
        오류가 발생했습니다
      </h2>
      <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          backgroundColor: "#34aa8f",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
