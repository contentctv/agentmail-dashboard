/**
 * Email Grid component - displays table of email events.
 * Fetches from GET /api/emails and shows paginated results.
 */
import { useState } from 'react';
import DetailModal from './DetailModal';

export default function EmailGrid({ emails, loading, error, onRefresh }) {
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const truncate = (str, maxLength = 50) => {
    if (!str) return '(no subject)';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-1">
              Error Loading Emails
            </h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Sender</div>
            <div className="col-span-4">Subject</div>
            <div className="col-span-3">Received</div>
            <div className="col-span-1">Status</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="col-span-1 text-gray-400 font-mono text-sm">
                #{email.id}
              </div>
              <div className="col-span-3 text-gray-200 truncate">
                {email.sender}
              </div>
              <div className="col-span-4 text-gray-300">
                {truncate(email.subject)}
              </div>
              <div className="col-span-3 text-gray-400 font-mono text-sm">
                {formatDate(email.received_at)}
              </div>
              <div className="col-span-1">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  email.processed 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {email.processed ? 'Done' : 'New'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && emails.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEmailId && (
        <DetailModal
          emailId={selectedEmailId}
          onClose={() => setSelectedEmailId(null)}
        />
      )}
    </>
  );
}
