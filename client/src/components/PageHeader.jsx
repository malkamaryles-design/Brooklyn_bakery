const PageHeader = ({ title, logo, onGoToShop, onLogout, children }) => (
  <header>
    {logo ? (
      <img
        src={logo}
        alt="לחנות"
        onClick={onGoToShop}
        className="header-logo"
        title="חזרה לחנות"
      />
    ) : (
      <h1
        onClick={onGoToShop}
        className={onGoToShop ? 'header-title--clickable' : ''}
        title={onGoToShop ? 'חזרה לחנות' : undefined}
      >
        {title}
      </h1>
    )}
    <div className="header-actions">
      {children}
      {onLogout && (
        <button className="outline-btn" onClick={onLogout}>יציאה</button>
      )}
    </div>
  </header>
);
export default PageHeader;