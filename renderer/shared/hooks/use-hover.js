import React from 'react'

// Hook
function useHover() {
  const [value, setValue] = React.useState(false)

  const ref = React.useRef(null)

  const handleMouseOver = () => setValue(true)
  const handleMouseOut = () => setValue(false)

  React.useEffect(
    () => {
      const node = ref.current
      if (node) {
        node.addEventListener('mouseover', handleMouseOver)
        node.addEventListener('mouseout', handleMouseOut)

        return () => {
          node.removeEventListener('mouseover', handleMouseOver)
          node.removeEventListener('mouseout', handleMouseOut)
        }
      }
      return () => null
    },
    [] // Recall only if ref changes
  )

  return [ref, value]
}

export default useHover
