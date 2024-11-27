"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Permissions } from "@/utils/permissions"

export default function CreatePerm() {
    const router = useRouter()
    const [role, setRole] = useState<string>("")
    const [perms, setPerms] = useState<Permissions[]>([])
    const [status, setStatus] = useState({status: false, display: false, message: 'Test'})

    function updatePerms(perm: Permissions) {
        if (perms.includes(perm)) {
            setPerms(perms.filter(p => p !== perm))
        } else {
            setPerms([...perms, perm])
        }
    }

    async function submit() {
        if (role === '') return setStatus({status: false, display: true, message: 'Role ID cannot be empty'})

        const res = await fetch('/api/staff/director/permissions', {
            method: 'POST',
            body: JSON.stringify({
                roleid: role,
                permissions: perms.join(',')
            })
        })

        if (res.ok) {
            setStatus({
                status: true,
                display: true,
                message: 'Changes saved successfully'
            })

            setTimeout(() => router.push('/staff/director/permissions'), 1000)
        } else {
            setStatus({
                status: false,
                display: true,
                message: 'Failed to save changes. ' + res.statusText
            })
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => setStatus({status: false, display: false, message: ''}), 5000)

        return () => clearTimeout(timeout)
    }, [status])

    return (
        <div className="flex flex-col">
            { status.display && <div className={`alert ${status.status ? 'alert-success' : 'alert-error'}`}>
                {status.status ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )} {status.message}
            </div> }

            <div className="flex flex-col max-w-lg mt-4">
                <label htmlFor="">Role ID</label>
                <div className="flex flex-row gap-4">
                    <input type="text" className="input input-sm bg-base-200 " value={role} required onChange={e => setRole(e.target.value)} />
                    <button className="btn btn-primary btn-sm w-fit" onClick={submit}>Submit</button>
                </div>
            </div>


            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PermCategory title="Staff Permissions" nodes={[
                    {label: "View Staff", perm: Permissions.VIEW_STAFF},
                    {label: "View Stats (Home page)", perm: Permissions.VIEW_STATS},
                    {label: "View Policies", perm: Permissions.VIEW_POLICIES},
                ]} perms={perms} updatePerms={updatePerms} />

                <PermCategory title="Presenter Permissions" nodes={[
                    {label: "View Presenters", perm: Permissions.VIEW_PRESENTERS},
                    {label: "View Resources", perm: Permissions.VIEW_RESOURCES},
                    {label: "View Requests", perm: Permissions.VIEW_REQUESTS},
                    {label: "View Timetable", perm: Permissions.VIEW_TIMETABLE},
                    {label: "View Connections", perm: Permissions.VIEW_CONNECTIONS},
                    {label: "Self Timetable", perm: Permissions.SELF_TIMETABLE},
                    {label: "Self Connection", perm: Permissions.SELF_CONNECTION},
                    {label: "Accept Requests", perm: Permissions.ACCEPT_REQUESTS},
                    {label: "Toggle Requests", perm: Permissions.TOGGLE_REQUESTS},
                ]} perms={perms} updatePerms={updatePerms} />

                <PermCategory title="Mentor Permissions" nodes={[
                    {label: "View Mentors", perm: Permissions.VIEW_MENTORS},
                    {label: "Manage Requests", perm: Permissions.MANAGE_REQUESTS},
                    {label: "Other Timetable", perm: Permissions.OTHERS_TIMETABLE},
                ]} perms={perms} updatePerms={updatePerms} />

                <PermCategory title="Manager Permissions" nodes={[
                    {label: "View Managers", perm: Permissions.VIEW_MANAGERS},
                    {label: "Manage Connections", perm: Permissions.MANAGE_CONNECTIONS},
                    {label: "Manage Resources", perm: Permissions.MANAGE_RESOURCES},
                ]} perms={perms} updatePerms={updatePerms} />

                <PermCategory title="Director Permissions" nodes={[
                    {label: "Administrator", perm: Permissions.ADMINISTRATOR},
                    {label: "View Directors", perm: Permissions.VIEW_DIRECTORS},
                    {label: "Manage Policies", perm: Permissions.MANAGE_POLICIES},
                    {label: "View Settings", perm: Permissions.VIEW_SETTINGS},
                    {label: "Edit Settings", perm: Permissions.EDIT_SETTINGS},
                    {label: "View Permissions", perm: Permissions.VIEW_PERMISSIONS},
                    {label: "Edit Permissions", perm: Permissions.EDIT_PERMISSIONS},
                    {label: "Create Permissions", perm: Permissions.CREATE_PERMISSIONS},
                    {label: "Delete Permissions", perm: Permissions.DELETE_PERMISSIONS},
                ]} perms={perms} updatePerms={updatePerms} />
            </div>
        </div>
    )
}

function PermCategory({title, nodes, perms, updatePerms}: {title: string, nodes: {label: string, perm: Permissions}[], perms: Permissions[], updatePerms: (perm: Permissions) => void}) {
    return (
        <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{title}</h2>
            {nodes.map((node, i) => <PermNode key={i} {...node} perms={perms} updatePerms={updatePerms} />)}
        </div>
    )
}

function PermNode({label, perm, perms, updatePerms}: {label: string, perm: Permissions, perms: string[], updatePerms: (perm: Permissions) => void}) {
    return (
        <div className="flex flex-row max-w-sm items-center gap-2">
            <input id={perm} type="checkbox" className="checkbox checkbox-sm" checked={perms.includes(perm)} onChange={() => updatePerms(perm)} />
            <label htmlFor={perm}>{label}</label>
        </div>
    )
}