import React from 'react'
import useFullName from './use-full-name'

function useUsername({address, nickname, firstName, lastName}) {
  const [username, setUsername] = React.useState(null)

  const fullName = useFullName({firstName, lastName})

  React.useEffect(() => setUsername(nickname || address || fullName), [
    address,
    fullName,
    nickname,
  ])

  return username
}

export default useUsername
