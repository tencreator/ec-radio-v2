"use client"
import { signIn } from "next-auth/react"

export default function Login({ redirect = '/staff' }: { redirect?: string }) {
    return (
        <div className="flex justify-center items-center">
            <div className="card min-w-96 mt-4 bg-base-300 border-2 border-solid border-base-200 p-4">
                <div className="card-title flex justify-center flex-row">
                    <img src="https://cdn.emeraldcoastrp.com/elogo64x64.png" width={32} alt="Logo" />
                    <h2 className="font-bold text-lg text-center">Sign in</h2>
                </div>

                <div className="mt-12 w-full flex flex-col gap-4">
                    <button
                        onClick={() => signIn('discord', { callbackUrl: redirect })}
                        className="btn text-white bg-discord border border-solid border-discord w-full flex items-center"
                    >
                        <i className="fa-brands fa-discord"></i>
                        <p>Sign in with Discord</p>
                    </button>
                </div>
            </div>
        </div>
    )
}