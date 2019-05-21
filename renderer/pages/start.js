import React, {useState, useEffect} from 'react'
import axios from 'axios'
import Layout from '../components/layout'
import {Input, Box} from '../shared/components'
import Flex from '../shared/components/flex'

export default function() {
  const [images, setImages] = useState([])
  const [term, setTerm] = useState('')

  useEffect(() => {
    if (term.length > 3) {
      axios
        .get('https://www.googleapis.com/customsearch/v1', {
          params: {
            q: term,
            cx: process.env.cseCx,
            key: process.env.cseKey,
            searchType: 'image',
          },
        })
        .then(resp => {
          const {data} = resp
          const {items} = data
          setImages(items.map(item => item.image))
        })
    }
  }, [term])

  return (
    <Layout>
      Idena Desktop
      <Box>
        <Input
          onInput={e => {
            setTerm(e.currentTarget.value)
          }}
        />
        <Flex css={{flexWrap: 'wrap'}}>
          {images.map(image => (
            <Box>
              <img src={image.thumbnailLink} alt={image.thumbnailLink} />
            </Box>
          ))}
        </Flex>
      </Box>
    </Layout>
  )
}
