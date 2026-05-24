'use client'

import { useEffect, useState } from "react"

type Data = {
    counts: {[key: string]: number},
    accuracy: number
}

export default function Stats() {

    const [data, setData] = useState<Data | null>(null)
    const [classes, setClasses] = useState<{[key: string]: string} | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        (async () => {
            setData(null)
            setError(null)
            try {
                let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
                    method: 'GET'
                })
                if (!response.ok) throw new Error('Error')
                let data = await response.json()
                setData(data)
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
                    method: 'GET'
                })
                if (!response.ok) throw new Error('Error')
                data = await response.json()
                setClasses(data)
            }
            catch (error) {
                if (error instanceof Error) {
                    setError(error)
                }
            }
        })()
    }, [])

    return (
        <div className="bg-gray-800 h-screen text-white flex flex-col items-center p-4">
            {error && <p>{error.message}</p>}
            <h2 className="font-bold text-xl p-4">Статистика</h2>
            <ul className="flex flex-col justify-between">
                {data && classes && Object.entries(data.counts).map(([key, value]) => 
                    <li key={key} className="">{classes[key]}: {value}</li>
                )}
            </ul>
            {data && <p>Точность: {data.accuracy}%</p>}
        </div>
    )
}