// client/src/components/Breadcrumbs.jsx

function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="breadcrumbs">
      <span className="crumb" onClick={() => onNavigate(null)}>Home</span>
      {path.map((folder) => (
        <span key={folder._id}>
          <span style={{ color: '#94a3b8', padding: '0 6px' }}>/</span>
          <span className="crumb" onClick={() => onNavigate(folder._id)}>
            {folder.filename}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;