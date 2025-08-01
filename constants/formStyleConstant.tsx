export const FORM_BASE_CLASSNAME = `
  block w-full px-4 py-2 text-base text-gray-800 border rounded-md
  focus:ring-1 focus:ring-gray-500 focus:border-gray-500 focus:outline-none focus:shadow-sm
  transition duration-200 ease-in-out
  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500
  placeholder-gray-400
  hover:border-gray-400 dark:hover:border-gray-600
`;

// --- Enhanced FORM_SELECT_CLASSNAME ---
export const FORM_SELECT_CLASSNAME = `
  ${FORM_BASE_CLASSNAME}
  appearance-none cursor-pointer
  bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem_1rem]
  bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")]
  dark:bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")]
  pr-10
`;

export const FORM_LABEL = `
  block text-sm font-medium text-gray-700 mb-1
  dark:text-gray-300 capitalize
`;
export const BUTTON_PRIMARY = `
  inline-flex items-center justify-center
  py-2.5 px-6
  bg-gradient-to-r from-gray-500 to-gray-600 text-white
  font-semibold rounded-lg shadow-md
  hover:from-gray-600 hover:to-gray-700
  focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-500
  transition duration-250 ease-in-out
  disabled:opacity-60 disabled:cursor-not-allowed
`;
export const BUTTON_ACCENT_WITH_ICON = `
  ${BUTTON_PRIMARY}
  flex items-center gap-2
  from-purple-500 to-indigo-600
  hover:from-purple-600 hover:to-indigo-700
`;

export const BUTTON_DEFAULT = `w-full py-2.5 px-6 border text-black hover:bg-gray-200 font-semibold rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`
export const BUTTON_SUBMIT = `w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`