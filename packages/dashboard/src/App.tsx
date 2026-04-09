import { useState } from 'react'
import { Button, greet } from '@bartools/ui'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>{greet('bartools dashboard')}</h1>
      <p>Count: {count}</p>
      <Button label="Increment" onPress={() => setCount((c) => c + 1)} />
    </main>
  )
}

export default App
