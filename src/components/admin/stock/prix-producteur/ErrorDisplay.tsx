interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-red-500 text-6xl">⚠️</div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Une erreur est survenue
        </h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}