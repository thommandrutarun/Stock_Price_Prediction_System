import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '70vh',
      color: '#fff',
      gap: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Market Lost</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
        The ticker or trading page you are looking for does not exist on this exchange floor.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem', marginTop: '10px' }}>
        Return to Exchange Home
      </Link>
    </div>
  );
};

export default NotFound;
