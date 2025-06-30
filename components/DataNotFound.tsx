import React from 'react';

const NoDataFound = ({
  title = "No Data Found",
  message = "Apologize, currently, we could not found the data you want",
  icon = (
    <svg
      xmlns="http://www.w3.org/2900/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-12 h-12 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.232 10.052 3.42 3.42a4.487 4.487 0 0 0 6.364-6.364l-3.42-3.42M4.5 12.75V15m7.5-6H9M8.25 5.25H12M12 21.75V12"
      />
    </svg>
  ),
  className = "",
  handleGoBack
}:{
    title?: string,
    message?: string,
    icon?: any,
    className?: string,
    handleGoBack: () => void
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm text-center ${className}`}
    >
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {message}
      </p>
      {/* Anda bisa menambahkan tombol atau link di sini jika diperlukan */}
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={handleGoBack}>
        Back
      </button>
    </div>
  );
};

export default NoDataFound;