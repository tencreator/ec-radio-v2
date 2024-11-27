import Link from "next/link"
import DeleteButton from "./DeleteButton"

export default async function ViewPolicies({res} : {res: Response}) {
    const policies = await res.json()

    return (
        <div className="mt-4 lg:w-11/12">
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {policies && policies.map((policy: any, i: number) => (
                    <li key={i}>
                        <div className="px-4 py-2 rounded-xl bg-base-300 border border-solid border-base-300 justify-start w-full font-semibold text-xl flex flex-row">
                            {policy.name}
                            <div className="ml-auto flex flex-row gap-4">
                                <Link className="btn btn-error btn-sm" href={`/staff/director/policies/${policy.id}`}>Edit</Link>
                                <DeleteButton id={policy.id} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export async function Skeleton() {
    return (
        <div className="mt-4 lg:w-11/12">
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <li>
                    <div className="btn bg-base-300 border border-solid border-base-300 justify-start w-full font-semibold text-xl">
                        <div className="w-full h-[2ch] skeleton"></div>
                    </div>
                </li>
            </ul>
        </div>
    )
}