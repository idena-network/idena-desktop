/* eslint-disable no-undef */
import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box, Button} from '../../../../../shared/components'
import Flex from '../../../../../shared/components/flex'
import ImageEditor from './image-editor'
import theme from '../../../../../shared/theme'
import {convertToBase64Url} from '../../../utils/useDataUrl'
import {
  IMAGE_SEARCH_PICK,
  IMAGE_SEARCH_TOGGLE,
} from '../../../../../../main/channels'

const activeStyle = {
  border: `solid 2px ${theme.colors.primary}`,
}

function CreateFlipForm({pics, onUpdateFlip}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickedUrl, setPickedUrl] = useState('')

  const handleImageSearchPick = (_, data) => {
    const [{url}] = data.docs[0].thumbnails
    setPickedUrl(url)
  }

  useEffect(() => {
    global.ipcRenderer.on(IMAGE_SEARCH_PICK, handleImageSearchPick)
    return () => {
      global.ipcRenderer.removeListener(
        IMAGE_SEARCH_PICK,
        handleImageSearchPick
      )
    }
  }, [])

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
    })
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (pickedUrl) {
      convertToBase64Url(pickedUrl, base64Url => {
        onUpdateFlip([
          ...pics.slice(0, selectedIndex),
          base64Url,
          ...pics.slice(selectedIndex + 1),
        ])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUrl])

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
        <ImageEditor src={pics[selectedIndex]} />
        <Flex justify="space-around">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={false}
          />

          <Button
            onClick={() => {
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, 1)
            }}
          >
            Search on Google
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

CreateFlipForm.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  onUpdateFlip: PropTypes.func.isRequired,
}

export default React.memo(CreateFlipForm)
