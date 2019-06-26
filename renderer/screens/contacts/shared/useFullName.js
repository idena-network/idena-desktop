import React from 'react'

function useFullName({firstName, lastName}) {
  const [fullName, setFullName] = React.useState(null)

  React.useEffect(() => {
    if (firstName || lastName) {
      setFullName(`${firstName} ${lastName}`.trim())
    }
  }, [firstName, lastName])

  return fullName
}

export default useFullName
