import React from 'react'

function copyText(text) {
  const tempInput = document.createElement('input')
  tempInput.type = 'text'
  tempInput.value = text

  document.body.appendChild(tempInput)

  tempInput.select()
  document.execCommand('copy')

  document.body.removeChild(tempInput)
}

function useClipboard() {
  const [value, setValue] = React.useState()
  const [error, setError] = React.useState()

  const copyToClipboard = React.useCallback(text => {
    if (typeof text !== 'string') {
      throw new Error(`You must copy a string, not ${typeof text}`)
    }
    try {
      copyText(text)
      setValue(text)
    } catch ({message}) {
      setError(message)
    }
  }, [])

  return [{value, error}, copyToClipboard]
}

export default useClipboard
