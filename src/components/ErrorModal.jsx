import React from 'react'

export default function ErrorModal({ onClose, info, canRetry, onRetry }) {
  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50  flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{info}</p>
          
          <div className="flex gap-2 justify-center">
            {canRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}