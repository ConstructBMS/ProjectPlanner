 
import { useState } from 'react';
import { Button } from '@constructbms/ui';
import { Projects } from '@constructbms/sdk';

export function SharedPackageTest() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const testSDK = async () => {
    setLoading(true);
    try {
      const { data, error } = await Projects.list();
      if (error) {
        console.error('SDK test error:', error);
      } else {
        setProjects(data || []);
        console.log('SDK test success:', data);
      }
    } catch (err) {
      console.error('SDK test exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        margin: '20px',
      }}
    >
      <h3>Shared Package Test - ProjectPlanner</h3>
      <p>This component tests the shared packages:</p>
      <ul>
        <li>✅ @constructbms/ui - Button component</li>
        <li>
          ✅ @constructbms/types - TypeScript interfaces (available for IDE
          hints)
        </li>
        <li>✅ @constructbms/sdk - Supabase data access</li>
      </ul>

      <Button onClick={testSDK} disabled={loading}>
        {loading ? 'Testing SDK...' : 'Test SDK Connection'}
      </Button>

      {projects.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h4>Projects from SDK:</h4>
          <ul>
            {projects.map(project => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
