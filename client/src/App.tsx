function MaintenancePage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: "560px",
        width: "100%",
        textAlign: "center",
        color: "#e2e8f0",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
        <h1 style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "12px",
          color: "#f8fafc",
        }}>
          System Upgrade in Progress
        </h1>
        <p style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#94a3b8",
          marginBottom: "32px",
        }}>
          New architectural foundations are arriving on the platform. For this reason,
          our servers will be inaccessible until further notice. We are currently working
          on safely migrating all user accounts and credits to the new system.
        </p>
        <p style={{
          fontSize: "14px",
          color: "#64748b",
        }}>
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}

function App() {
  return <MaintenancePage />;
}

export default App;
