'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {

    const [error, setError] = useState<Error | null>(null)

    async function training() {
        setError(null)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/training`, {
            method: 'POST'
            })
        }
        catch (error) {
            if (error instanceof Error) {
            setError(error)
            }
        }
    }
    
    return (
        <header className='bg-gray-900 border-b border-white/25 flex gap-4 p-4 items-center text-white'>
            <h1 className="w-fit font-bold px-2">AI Chat</h1>
            <Link href='/stats'>Stats</Link>
            {error && <p>{error.message}</p>}
            <button onClick={() => training()} className='w-fit text-sm border border-white/25 rounded-lg p-4 ml-auto'>⟳ Переобучить</button>
        </header>
    )
}