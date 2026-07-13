import PageWrapper from '../components/Layout/PageWrapper';

function ActivityLog() {
  return (
    <PageWrapper
      title="Activity Log"
      description="Track all create, update, and delete actions."
    >
      <div className="placeholder-card glass">
        <div className="placeholder-icon">📊</div>
        <p className="placeholder-title">Activity log coming in Phase 5</p>
        <p className="placeholder-text">Timeline of all system actions with timestamps.</p>
      </div>
    </PageWrapper>
  );
}

export default ActivityLog;
