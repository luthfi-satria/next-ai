export type TableObject<TData extends Record<string, unknown>> = {
  id?: string
  column: TableColumnProp<TData>[]
  data: TData[]
}

export type TableColumnProp<TData extends Record<string, unknown>> = {
  name: string
  columnKey: keyof TData
  translater?: (value: TData[keyof TData], rowData: TData) => React.ReactNode
}

export default function TableContentComponent<
  TData extends Record<string, unknown>,
>({ column, data, id }: TableObject<TData>) {
  return (
    <div className="overflow-x-auto shadow-md">
      <table
        className="min-w-full divide-y divide-gray-200"
        id={id ?? "default_table"}
      >
        <thead className="bg-gray-100">
          <tr>
            {column.map((items, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                {items.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(data) &&
            data.map((rowData, rowIndex) => (
              <tr
                key={(rowData.id as string) || (rowIndex as number)}
                className="hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                {column.map((col) => (
                  <td
                    key={col.columnKey.toString() + "_" + rowIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                  >
                    {col.translater
                      ? col.translater(rowData[col.columnKey], rowData)
                      : String(rowData[col.columnKey])}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
