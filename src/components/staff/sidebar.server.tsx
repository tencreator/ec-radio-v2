"use server"
import { hasPermission, Permissions } from '@/utils/permissions'
import { auth } from '@/utils/auth'

import SidebarClient from './sidebar.client'

interface Catagories {
    title: string
    perm: Permissions
    children: {
        title: string
        href: string
        perm: Permissions
    }[]
}

interface CatagoriesMin {
    title: string
    children: {
        title: string
        href: string
    }[]
}

export default async function Sidebar(): Promise<JSX.Element> {
    const session = await auth()
    const catagories: Catagories[] = [
        {
            title: 'Staff',
            perm: Permissions.VIEW_STAFF,
            children: [{
                title: 'Home',
                href: '/staff',
                perm: Permissions.VIEW_STATS
            }, {
                title: 'Policies',
                href: '/staff/policies',
                perm: Permissions.VIEW_POLICIES
            }]
        },
        {
            title: 'Presenters',
            perm: Permissions.VIEW_REQUESTS,
            children: [{
                title: 'Timetable',
                href: '/staff/presenter/timetable',
                perm: Permissions.VIEW_TIMETABLE
            }, {
                title: 'Requests',
                href: '/staff/presenter/requests',
                perm: Permissions.VIEW_REQUESTS
            }, {
                title: 'Connection',
                href: '/staff/presenter/connection',
                perm: Permissions.SELF_CONNECTION
            }, {
                title: 'Resources',
                href: '/staff/presenter/resources',
                perm: Permissions.VIEW_RESOURCES
            }]
        },
        {
            title: 'Mentors',
            perm: Permissions.VIEW_MENTORS,
            children: [{
                title: 'Request Logs',
                href: '/staff/mentor/requests',
                perm: Permissions.MANAGE_REQUESTS
            }]
        }
    ]

    const allowed: CatagoriesMin[] = await catagories.map(async (catagory) => {
        if (await hasPermission(session?.user.providerId as string, catagory.perm)) {
            const allowedChildren: {title: string, href: string}[] = []

            catagory.children.forEach(async (child) => {
                if (await hasPermission(session?.user.providerId as string, child.perm)) {
                    allowedChildren.push({
                        title: child.title,
                        href: child.href
                    })
                }
            })

            return {
                title: catagory.title,
                children: allowedChildren
            }
        }        
    })

    console.log('Allowed Catagories: ', JSON.stringify(allowed))
    
    return (
        <SidebarClient catagories={allowed}  />
    )
}