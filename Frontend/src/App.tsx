import { useState, useEffect } from 'react'
import PublicPages from './Pages/Public/PublicPages'
import PrivatePages from './Pages/Private/PrivatePages'
import "./style.css"
import NetworkError from './Pages/NetworkError'
import { deleteToken, setToken } from './script/utils'

function App() {
  const [LoginToken, setLoginToken] = useState<string | null>(null)
  const [Error,setError]=useState<string|null>(null);
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
      setToken(token)
      setLoginToken(token)
    } else {
      deleteToken();
      setLoginToken(null)
    }
  }
  if(Error!==null)
    return <NetworkError err={Error}/>
  return (
    <>
      {LoginToken == null ? (
        <PublicPages setLoginToken={handleSetLoginToken} />
      ) : (
        <PrivatePages setError={setError} LoginToken={LoginToken} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App