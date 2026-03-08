/**
 * Dashboard component - main view for AgentMail monitoring.
 * Orchestrates email list, auto-refresh, and empty/loading states.
 */
import { useState, useEffect } from 'react';
import { fetchEmails } from '../api/emails';
import EmailGrid from './EmailGrid';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadEmails = async () => {
    try {
      setError(null);
      const data = await fetchEmails(1, 50);
      setEmails(data.items);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadEmails();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      loadEmails();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setLoading(true);
    loadEmails();
  };

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastRefresh) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                AgentMail Dashboard
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Monitoring: <span className="font-mono">codybeartv_ai_assistant@agentmail.to</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    autoRefresh
                      ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                      : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}
                >
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </button>
                <span className="text-xs text-gray-500">
                  Last: {formatLastRefresh()}
                </span>
              </div>
              
              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors flex items-center gap-2"
              >
                <svg 
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Total Emails</div>
            <div className="text-3xl font-bold text-gray-100">{emails.length}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Webhook Status</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-green-400">Active</span>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Latest Email</div>
            <div className="text-lg font-semibold text-gray-100">
              {emails.length > 0 
                ? formatLastRefresh() 
                : 'No emails yet'}
            </div>
          </div>
        </div>

        {/* Email Grid or Empty State */}
        {loading && emails.length === 0 ? (
          <LoadingSpinner message="Loading emails..." />
        ) : emails.length === 0 ? (
          <EmptyState />
        ) : (
          <EmailGrid 
            emails={emails}
            loading={loading}
            error={error}
            onRefresh={handleManualRefresh}
          />
        )}
      </main>
    </div>
  );
}
