import React, {useEffect} from 'react'
import Layout from '../components/layout'
import {Box, Button} from '../shared/components'

export default function() {
  useEffect(() => {
    global.ipcRenderer.on('image-search/picked-main', (ev, data) => {
      console.log(`from main: ${data}`)
    })
    global.ipcRenderer.on('image-search/picked', (ev, data) => {
      console.log(`from renderer:${data}`)
    })
  }, [])

  return (
    <Layout>
      Idena Desktop
      <Box>
        <Button
          onClick={() => {
            global.ipcRenderer.send('image-search/toggle', 1)
          }}
        >
          Open picker
        </Button>
        <Button
          onClick={() => {
            global.ipcRenderer.send('image-search/toggle', 0)
          }}
        >
          Close picker
        </Button>
      </Box>
    </Layout>
  )
}
