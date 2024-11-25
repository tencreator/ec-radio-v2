"use client"

export function CopyButton({text}: {text: string}) {
    function copyText() {
        navigator.clipboard.writeText(text)
    }
    
    return (
        <button className='w-fit ml-4 hidden sm:block' onClick={copyText}><i className='fa-solid fa-clipboard'></i></button>
    )
}