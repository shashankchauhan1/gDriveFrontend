// client/src/components/Breadcrumbs.jsx

function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav style={{ marginBottom: '20px' }}>
      {/* "Home" is the root level */}
      <span
        onClick={() => onNavigate(null)}
        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
      >
        Home
      </span>

      {/* Map over the path segments */}
      {path.map((folder) => (
        <span key={folder._id}>
          {' / '}
          <span
            onClick={() => onNavigate(folder._id)}
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            {folder.filename}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;