import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={viteLogo} className="w-20 h-20" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={reactLogo} className="w-20 h-20 animate-spin" alt="React logo" />
        </a>
      </div>
      
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        Vite + React
      </h1>
      <h2 className="text-2xl text-gray-700 mb-8">กับ Tailwind CSS v4! 🎉</h2>
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg mb-4"
        >
          Count is {count}
        </button>
        <p className="text-center text-gray-600">
          Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      <p className="text-center text-gray-500 mt-8 max-w-md">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
