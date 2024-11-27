import Link from "next/link"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import DeleteButton from "./DeleteButton"
import CopyButton from "@/components/utils/CopyButton"

export default async function PermList({perms}: {perms: {id: string, roleid: string, roleName: string}[]}) {
    const session = await auth()
    const canDelete = await hasPermission(session?.user?.providerId, Permissions.DELETE_PERMISSIONS)
    const canEdit = await hasPermission(session?.user?.providerId, Permissions.EDIT_PERMISSIONS)

    return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {perms && perms.map((perm: {id: string, roleid: string, roleName: string}, i: number) => (
                <li key={i}>
                    <div className="px-4 py-2 rounded-xl bg-base-300 border border-solid border-base-300 justify-start w-full font-semibold text-xl flex flex-row">
                        <div className="flex flex-row">{perm.roleName || perm.roleid} <CopyButton text={`<@&${perm.roleid}>`} /></div>
                        <div className="ml-auto flex flex-row gap-4">
                            {canEdit && <Link className="btn btn-secondary btn-sm" href={`/staff/director/permissions/${perm.id}`}>Edit</Link>}
                            {canDelete && <DeleteButton id={perm.id} />}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}