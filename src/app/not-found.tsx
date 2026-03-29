import Link from "next/link";

export default function NotFound() {
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
        페이지를 찾을 수 없습니다
      </h2>
      <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
        요청하신 페이지가 존재하지 않습니다.
      </p>
      <Link
        href="/"
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          backgroundColor: "#34aa8f",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 500,
          textDecoration: "none",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
