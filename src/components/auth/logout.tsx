"use client"
import { signOut } from "next-auth/react"

export default function Signout() {
    return (
        <div className="flex justify-center items-center">
            <div className="card min-w-96 mt-4 bg-base-300 border-2 border-solid border-base-200 p-4">
                <div className="card-title flex justify-center flex-row">
                    <img src="https://cdn.emeraldcoastrp.com/elogo64x64.png" width={32} alt="Logo" />
                    <h2 className="font-bold text-lg text-center">Are you sure you want to sign out?</h2>
                </div>

                <div className="mt-12 w-full flex flex-col gap-4">
                    <button
                        onClick={async () => signOut()}
                        className="btn text-white bg-danger border border-solid border-danger w-full flex items-center"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <p>Sign Out</p>
                    </button>
                </div>
            </div>
        </div>
    )
}