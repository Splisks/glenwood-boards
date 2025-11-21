// app/page.tsx
export default function HomePage() {
  return (
    <main
      style={{
        padding: 24,
        color: "#e5e7eb",
        background: "#0b1120",
        minHeight: "100vh"
      }}
    >
      <h1>GLENWOOD DRIVE-IN &amp; MENU BOARDS</h1>
      <p>
        USE{" "}
        <a href="/admin" style={{ textDecoration: "underline", color: "#38bdf8" }}>ADMIN</a>{" "}
       TO MANAGE THE MENU OR VIEW A SCREEN: {" "}
     </p>
     <p>
        <a href="/screens/screen-1" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SERVICE-1
        </a>{" "}
        <a href="/screens/screen-2" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SERVICE-2
        </a>{" "}
        <a href="/screens/screen-3" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SERVICE-3
        </a>{" "}
        <a href="/screens/screen-4" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SERVICE-4
        </a>{" "}
        </p>
        <p>
        <a href="/screens/screen-5" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SEATING-TOP-LEFT
        </a>{" "}
        <a href="/screens/screen-6" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SEATING-TOP-RIGHT
        </a>{" "}
      </p>
      <p>
        <a href="/screens/screen-7" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SEATING-BOTTOM-LEFT
        </a>{" "}
        <a href="/screens/screen-8" style={{ textDecoration: "underline", color: "#38bdf8" }}>
          SEATING-BOTTOM-RIGHT
        </a>{" "}
      </p>
    </main>
  );
}
