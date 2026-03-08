/**
 * Main App component with Error Boundary.
 * Entry point for AgentMail Dashboard frontend.
 */
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
