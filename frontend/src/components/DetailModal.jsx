/**
 * Detail Modal component for displaying full JSON payload.
 * Shows parsed email data in a formatted, scrollable view.
 */
import { useEffect, useState } from 'react';
import { fetchEmailDetail } from '../api/emails';

export default function DetailModal({ emailId, onClose }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEmailDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmailDetail(emailId);
        if (isMounted) {
          setEmail(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmailDetail();

    return () => {
      isMounted = false;
    };
  }, [emailId]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Parse raw_json
  let jsonPayload = null;
  try {
    if (email && email.raw_json) {
      jsonPayload = JSON.parse(email.raw_json);
    }
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">
            Email Detail
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded p-4 text-red-400">
              <p className="font-semibold mb-1">Error Loading Email</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && email && (
            <div className="space-y-6">
              {/* Metadata Section */}
              <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Metadata
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">ID</dt>
                    <dd className="text-gray-200 font-mono">{email.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Message ID</dt>
                    <dd className="text-gray-200 font-mono text-sm break-all">{email.message_id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Sender</dt>
                    <dd className="text-gray-200">{email.sender}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Subject</dt>
                    <dd className="text-gray-200">{email.subject || '(no subject)'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Received At</dt>
                    <dd className="text-gray-200 font-mono text-sm">
                      {new Date(email.received_at).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Processed</dt>
                    <dd>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        email.processed 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {email.processed ? 'Yes' : 'No'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* JSON Payload Section */}
              <div className="bg-gray-900/50 border border-gray-700 rounded">
                <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Raw JSON Payload
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(email.raw_json);
                      alert('JSON copied to clipboard');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  {jsonPayload ? (
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(jsonPayload, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">Unable to parse JSON payload</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
