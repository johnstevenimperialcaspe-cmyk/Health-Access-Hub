import React from "react";

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      <span>Loading...</span>
    </div>
  </div>
);

export default LoadingSpinner;
