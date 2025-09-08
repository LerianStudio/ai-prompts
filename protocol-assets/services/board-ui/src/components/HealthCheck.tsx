import { useState, useEffect } from 'react';

export const HealthCheck = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(err => setHealth({ status: 'error', error: err.message }));
  }, []);

  if (!health) return <div>Checking health...</div>;

  return (
    <div className={`p-2 rounded ${
      health.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
    }`}>
      Service Status: {health.status}
    </div>
  );
};