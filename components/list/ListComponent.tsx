type listComponentProps = {
    title: string
    listObj: Record<string, any>
}

export default function ListComponent(props: listComponentProps) {
    const { title, listObj } = props
    return (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">{title}:</h2>
            {Object.keys(listObj).map((keyname) => (
                <div key={`list${keyname}`} className="mb-5 pb-4 border-b border-gray-100 last:mb-0 last:border-b-0">
                    {Array.isArray(listObj[keyname]) ? (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{keyname}:</h3>
                            <ul className="list-disc pl-8 space-y-2 text-gray-700">
                                {listObj[keyname].map((listItem: string, listItemIndex: number) => (
                                    <li key={`listItem-${listItemIndex}`}>
                                        {listItem}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="flex flex-row gap-4">
                            <div className="text-xl font-bold text-gray-800">{keyname}:</div>
                            <div className="text-white bg-green-700 rounded-md p-1 w-full flex-grow text-center">
                                {typeof listObj[keyname] == "boolean" ? (listObj[keyname] == false ? 'No' : 'Yes') : (typeof listObj[keyname] == 'number' ? listObj[keyname].toFixed(2) : listObj[keyname])}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}