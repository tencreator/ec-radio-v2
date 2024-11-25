const thClasses = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'
interface Props {
    headings: string[]
    data: any[]
}
export default function Table({ headings, data }: Props) {
    return (
        <div className="border-2 border-base-300 rounded-md mt-4 bg-base-200 w-screen md:w-full">
            <div className="relative w-full overflow-auto">
                <table className={"w-full table-auto caption-bottom text-sm border-collapse border-base-300"}>
                    <thead className='[&_tr]:border-b border-collapse border-base-300'>
                        <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                            {headings.map((heading, index) => (
                                <th key={index} className={thClasses}>{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='[&_tr:last-child]:border-0 border-base-300'>
                        {data.map((row, index) => (
                            <tr key={index} className='border-b border-gray-500 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                                {headings.map((heading, index) => {
                                    const key = heading.toLowerCase().replace(' ', '_')

                                    if (!row[key]) return (
                                        <td key={index} className='h-12 px-4 align-middle'>&nbsp;</td>
                                    )

                                    return (
                                        <td key={index} className='h-12 px-4 align-middle'>{row[key]}</td>
                                    )
                                })}
                            </tr>
                        ))}                                 
                    </tbody>
                </table>
            </div>
        </div>
    )
}