import Link from "next/link"

export default async function ViewPolicies({res} : {res: Response}) {
    const policies = await res.json()

    return (
        <div className="mt-4 lg:w-11/12">
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {policies && policies.map((policy: any, i: number) => (
                    <li key={i}>
                        <Link className="btn bg-base-300 border border-solid border-base-300 justify-start w-full font-semibold text-xl" href={`/staff/policies/${policy.id}`}>{policy.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}