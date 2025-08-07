"use client"

import Link from "next/link"
import ConfirmModal from "./ConfirmModal"
import TableFilters, { FilterConfig, FilterValues } from "./table/TableFilters"

export type ContentProps = {
  title: string
  addButton?:
    | {
        href: string
        label: string
      }
    | undefined
  addFilter:
    | {
        config: FilterConfig[]
        onFilterChange: (filters: FilterValues) => void
        currentFilters: FilterValues
        onSearch: () => void
        onReset: () => void
      }
    | undefined
  modal:
    | {
        title: string
        confirmText: string
        cancelText: string
        isOpen: boolean
        onClose: () => void
        onConfirm: () => void
      }
    | undefined
}

export function AdminContentWrapperComponent({
  props,
  children,
}: {
  props: ContentProps
  children: React.ReactNode
}) {
  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            {props.title}
          </h1>
          <div className="flex flex-col mb-6">
            {props.addButton && (
              <div className="mb-6">
                <Link
                  href={props.addButton.href}
                  className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                >
                  ✨ {props.addButton.label}
                </Link>
              </div>
            )}
            <div className="w-full flex flex-col">
              {props.addFilter && (
                <>
                  <TableFilters
                    filtersConfig={props.addFilter.config}
                    onFilterChange={props.addFilter.onFilterChange}
                    initialFilterValues={props.addFilter.currentFilters}
                    // debounceTime={500} // Anda bisa customize debounce time jika diperlukan
                  />
                  <div className="flex w-full gap-4 justify-end">
                    <button
                      onClick={props.addFilter.onSearch}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 self-end" // self-end untuk alignment
                    >
                      Find
                    </button>
                    <button
                      onClick={props.addFilter.onReset}
                      className="px-4 py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 self-end" // self-end untuk alignment
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {children}
        </div>
        {props.modal && (
          <ConfirmModal
            isOpen={props.modal.isOpen}
            onClose={props.modal.onClose}
            onConfirm={props.modal.onConfirm}
            title={props.modal.title}
            confirmText={props.modal.confirmText}
            cancelText={props.modal.cancelText}
          />
        )}
      </div>
    </>
  )
}

export const translateName = (
  value: string,
  _rowData: Record<string, unknown>,
) => {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-lg">
        {value.charAt(0).toUpperCase()}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  )
}
