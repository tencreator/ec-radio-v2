"use client"

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

                        {
                        data && data.length > 0 ?
                        data.map((row, index) => (
                            <tr key={index} className='border-b border-gray-500 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                                {headings.map((heading, index) => {
                                    const key = heading.toLowerCase().replace(' ', '_')

                                    if (!row[key]) return (
                                        <td key={index} className='h-12 px-4 align-middle'>&nbsp;</td>
                                    )

                                    if (key === 'user') return (
                                        <RenderUserCell key={index} user={row[key]} />
                                    )

                                    return (
                                        <td key={index} className='h-12 px-4 align-middle'>{row[key]}</td>
                                    )
                                })}
                            </tr>
                        )) : (
                            <tr className='border-b border-gray-500 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                                <td colSpan={headings.length} className='h-12 px-4 align-middle text-center'>No data found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function RenderUserCell({ user }: { user: {id: string, name: string, avatar: string }}) {
    return (
        <td className='h-12 px-4 align-middle'>
            <div className='flex items-center'>
                <img src={user.avatar} alt={user.name} className='w-8 h-8 rounded-full mr-2' />
                <span>{user.name}</span>
                <button onClick={()=>{
                    "use client"
                    navigator.clipboard.writeText(`<@${user.id}>`)
                }}><i className="ml-4 fa-solid fa-clipboard"></i></button>
            </div>
        </td>
    )
}