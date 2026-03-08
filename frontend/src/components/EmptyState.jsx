/**
 * Empty State component displayed when no emails are present.
 * Shows friendly message indicating webhook listener is active.
 */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 max-w-lg text-center">
        <svg 
          className="w-20 h-20 text-gray-600 mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-300 mb-3">
          No Emails Yet
        </h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Listening for inbound AgentMail webhooks...
          <br />
          <span className="text-sm text-gray-500">
            codybeartv_ai_assistant@agentmail.to
          </span>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Webhook endpoint active</span>
        </div>
      </div>
    </div>
  );
}
