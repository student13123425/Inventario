import { useState, useEffect } from 'react'
import PublicPages from './Pages/Public/PublicPages'
import PrivatePages from './Pages/Private/PrivatePages'
import "./style.css"

function App() {
  const [LoginToken, setLoginToken] = useState<string | null>(null)

  // Check for token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setLoginToken(storedToken)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setLoginToken(null)
  }

  // Handle successful login/register
  const handleSetLoginToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('authToken', token)
      setLoginToken(token)
    } else {
      localStorage.removeItem('authToken')
      setLoginToken(null)
    }
  }

  return (
    <>
      {LoginToken == null ? (
        <PublicPages setLoginToken={handleSetLoginToken} />
      ) : (
        <PrivatePages LoginToken={LoginToken} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App