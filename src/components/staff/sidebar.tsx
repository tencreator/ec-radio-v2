"use client"
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

import Styles from '../../styles/sidebar.module.css'
import { hasPermissionSync, PagePermissions, Permissions } from '@/utils/permissions'

export default function Sidebar({perms}: {perms: string[]}) {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<any>()
    const sidebarRef = useRef<HTMLDivElement>(null)
    const sidebarToggleRef = useRef<HTMLButtonElement>(null)

    useEffect(()=>{
        setSession({
            user: {
                perms: perms
            }
        })
        setLoading(false)
    }, [perms])

    useEffect(()=>{
        if (!sidebarRef.current) return;

        if (show) {
            sidebarRef.current.style.left = '0';
        } else {
            sidebarRef.current.style.left = '-100%';
        }

        const handleOutsideClick = (e: MouseEvent) => {
            if (sidebarToggleRef.current?.contains(e.target as Node)) return;
            if (sidebarRef.current?.contains(e.target as Node)) return;

            setShow(false);
        }

        document.addEventListener('click', handleOutsideClick);

        return () => document.removeEventListener('click', handleOutsideClick)
    }, [show])


    return (
        <div className='min-h-full'>
            <button ref={sidebarToggleRef} className='btn bg-slate-800 border border-solid border-gray-500 fixed top-20 right-5 text-2xl z-50 lg:hidden' onClick={()=>setShow(!show)}>
                <i className='fas fa-bars'></i>
            </button>

            <div ref={sidebarRef} className={'bg-base-300 ' + Styles.sidebar}>
                {loading ? <p>Loading...</p> : (
                    <ul className="menu">
                        <SidebarCatagory session={session} title='Staff' perm={Permissions.VIEW_STAFF}>
                            <SidebarLink session={session} href='/staff' title='Home' perm={Permissions.VIEW_STATS} />
                            <SidebarLink session={session} href='/staff/policies' title='Policies' perm={Permissions.VIEW_POLICIES} />
                        </SidebarCatagory>
                        <SidebarCatagory session={session} title='Presenters' perm={Permissions.VIEW_REQUESTS}>
                            <SidebarLink session={session} href='/staff/presenter/requests' title='Requests' perm={Permissions.VIEW_REQUESTS} />
                            <SidebarLink session={session} href='/staff/presenter/connection' title='Connection' perm={Permissions.SELF_CONNECTION} />
                        </SidebarCatagory>
                    </ul>
                )}
            </div>
        </div>
    )
}

function SidebarCatagory({ title, perm, children, session }: { title: string, perm: PagePermissions, children: React.ReactNode, session: any }) {
    const [open, setOpen] = useState(false)
    const [allowed, setAllowed] = useState(false)
    const sidebarRef = useRef<HTMLUListElement>(null)

    useEffect(()=>{
        const open = localStorage.getItem(`sidebar-catagory-${title}`)

        if (open) {
            setOpen(open === 'true')
        }
    }, [])

    useEffect(()=>{
        if (!sidebarRef.current) return;

        localStorage.setItem(`sidebar-catagory-${title}`, open.toString())

        if (open) {
            sidebarRef.current.style.height = 'auto';
        } else {
            sidebarRef.current.style.height = '0';
        }
    }, [open])

    useEffect(()=>{
        setAllowed(hasPermissionSync(session, perm))
    }, [session])

    if (!allowed) return null;

    return (
        <li>
            <div className='flex flex-row' onClick={()=>setOpen(!open)}>
                <h3 onClick={()=>setOpen(!open)}>{title}</h3>
                <i className={'ml-auto fas fa-chevron-' + (open ? 'up' : 'down')}></i>
            </div>
            <ul ref={sidebarRef}>
                {open && children}
            </ul>
        </li>
    )
}

function SidebarLink({ href, title, perm, session }: { href: string, title: string, perm: PagePermissions, session: any }) {
    const [allowed, setAllowed] = useState(false)

    useEffect(()=>{
        const perms = hasPermissionSync(session, perm)
        console.log(title, perm, perms)
        setAllowed(perms)
    }, [session])

    if (!allowed) return null;

    return <li><Link href={href}>{title}</Link></li>
}