import PageWrapper from '../components/Layout/PageWrapper';

function Dashboard() {
  return (
    <PageWrapper
      title="Dashboard"
      description="Welcome to StudentHub — your student management dashboard."
    >
      <div className="placeholder-card glass">
        <div className="placeholder-icon">🚀</div>
        <p className="placeholder-title">Dashboard coming in Phase 3</p>
        <p className="placeholder-text">Stats, charts, and recent activity will appear here.</p>
      </div>
    </PageWrapper>
  );
}

export default Dashboard;
