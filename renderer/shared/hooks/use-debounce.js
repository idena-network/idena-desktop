import {useState, useEffect} from 'react'

export function useDebounce(initialValue, delay) {
  const [debouncedValue, setDebouncedValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(initialValue)
    }, delay)

    return () => clearTimeout(handler)
  }, [initialValue, delay])

  return debouncedValue
}
