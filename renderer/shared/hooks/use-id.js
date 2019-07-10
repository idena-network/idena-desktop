import React from 'react'

let id = 0
// eslint-disable-next-line no-plusplus
const genId = () => ++id

export default function useId() {
  // eslint-disable-next-line no-shadow
  const [id, setId] = React.useState(null)
  React.useEffect(() => setId(genId()), [])
  return id
}
