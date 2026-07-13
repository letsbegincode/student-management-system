function PageWrapper({ children, title, description }) {
  return (
    <div className="page-wrapper">
      {title && (
        <div className="page-header">
          <h2 className="page-title">{title}</h2>
          {description && <p className="page-description">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default PageWrapper;
