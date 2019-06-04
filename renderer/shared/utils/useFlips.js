import {useState, useEffect} from 'react'

const {getDrafts, getPublishedFlips} = global.flipStore

function useFlips() {
  const [drafts, setDrafts] = useState([])
  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const drafts = getDrafts()
    setDrafts(drafts)
  }, [])

  const [published, setPublished] = useState([])
  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const published = getPublishedFlips()
    setPublished(published)
  }, [])

  return {drafts, published}
}

export default useFlips
