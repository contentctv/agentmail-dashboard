/**
 * Loading Spinner component for async operations.
 * Displays centered spinner during data fetching.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-400 text-lg">{message}</p>
    </div>
  );
}
