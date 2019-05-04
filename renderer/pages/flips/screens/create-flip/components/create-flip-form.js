import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {Box, Button} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import ImageEditor from './image-editor'
import theme from '../../../../../shared/theme'

const compressChannel = 'compress-flip-source'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

function CreateFlipForm({pics, onUpdateFlip}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // const onCompressEnd = (_ev, data) => {
  //   setPics([
  //     ...pics.slice(0, globIdx),
  //     URL.createObjectURL(new Blob([data], {type: 'image/jpeg'})),
  //     ...pics.slice(globIdx + 1),
  //   ])
  // }

  // useEffect(() => {
  //   global.ipcRenderer.on(compressChannel, onCompressEnd)

  //   return () => {
  //     global.ipcRenderer.removeListener(compressChannel, onCompressEnd)
  //   }
  // }, [])

  const handleUpload = e => {
    e.preventDefault()

    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image')) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        re.target.result,
        ...pics.slice(selectedIndex + 1),
      ])
      // global.ipcRenderer.send(
      //   compressChannel,
      //   new Uint8Array(readerEvent.target.result)
      // )
    })
    reader.readAsDataURL(file)
  }

  const handleEdit = img => {
    onUpdateFlip([
      ...pics.slice(0, selectedIndex),
      img,
      ...pics.slice(selectedIndex + 1),
    ])
  }

  return (
    <Flex>
      <Box p={theme.spacings.normal}>
        {pics.map((src, idx) => (
          <Box
            key={idx}
            onClick={() => {
              setSelectedIndex(idx)
            }}
            css={idx === selectedIndex ? activeStyle : {}}
          >
            <img src={src} alt={`flip-${idx}`} width={100} />
          </Box>
        ))}
      </Box>
      <Box p={theme.spacings.normal}>
        <ImageEditor src={pics[selectedIndex]} onEdit={handleEdit} />
        <Flex justify="space-around">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={false}
          />
          <Button>Search on Google</Button>
        </Flex>
      </Box>
    </Flex>
  )
}

CreateFlipForm.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  onUpdateFlip: PropTypes.func.isRequired,
}

export default CreateFlipForm
