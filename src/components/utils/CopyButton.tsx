"use client"

export default function CopyButton({text}: {text: string}) {
    function copy() {
        navigator.clipboard.writeText(text)
    }

    return (
        <button onClick={copy} className="ml-2 btn btn-ghost btn-sm"><i className="fa-solid fa-clipboard"></i></button>
    )
}