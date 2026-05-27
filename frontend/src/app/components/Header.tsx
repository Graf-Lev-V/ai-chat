'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    async function training() {
        setError(null)
        setLoading(true)
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
        finally {
            setLoading(false)
        }
    }
    
    
    return (
        <header className='bg-gray-900 border-b border-white/25 flex gap-4 p-4 items-center text-white'>
            <Link href='/' className="w-fit font-bold px-2">AI Chat</Link>
            <Link href='/stats'>Stats</Link>
            {error && <p className='bg-red-500/20 border border-red-500 text-white rounded-md px-3 py-2 text-sm'>{error.message}</p>}
            <button 
            onClick={() => training()} 
            className='w-fit text-sm border border-white/25 rounded-lg p-4 ml-auto hover:cursor-pointer' 
            disabled={loading}
            >⟳ {loading ? 'Training' : "Retrain"}</button>
        </header>
    )
}