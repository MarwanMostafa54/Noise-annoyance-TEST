import React from 'react'
import useStore from '../store/useStore'

export default function Home() {
  const { count, increase } = useStore()

  return (
    <section className="bg-white/70 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold mb-2">Home</h2>
      <p className="mb-4">This is a small Vite + React + Tailwind demo with zustand and react-router.</p>
      <div className="flex items-center gap-4">
        <button onClick={increase} className="px-4 py-2 bg-slate-900 text-white rounded">Increase</button>
        <div>Count: <strong>{count}</strong></div>
      </div>
    </section>
  )
}
