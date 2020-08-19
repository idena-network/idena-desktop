import React from 'react'

function useClipboard() {
  const [value, setValue] = React.useState()
  const [error, setError] = React.useState()

  const copyToClipboard = React.useCallback(text => {
    if (typeof text !== 'string') {
      throw new Error(`You must copy a string, not ${typeof text}`)
    }
    try {
      navigator.clipboard.writeText(text)
      setValue(text)
    } catch ({message}) {
      setError(message)
    }
  }, [])

  return [{value, error}, copyToClipboard]
}

export default useClipboard
