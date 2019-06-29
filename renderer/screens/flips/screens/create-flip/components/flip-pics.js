import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {rem, borderRadius, margin} from 'polished'
import {FiSearch} from 'react-icons/fi'
import {Box, Input} from '../../../../../shared/components'
import Divider from '../../../../../shared/components/divider'
import Flex from '../../../../../shared/components/flex'
import ImageEditor from './image-editor'
import theme from '../../../../../shared/theme'
import {convertToBase64Url} from '../../../shared/utils/useDataUrl'
import {
  IMAGE_SEARCH_PICK,
  IMAGE_SEARCH_TOGGLE,
} from '../../../../../../main/channels'
import FlipImage from '../../../shared/components/flip-image'
import {IconButton} from '../../../../../shared/components/button'

function FlipPics({pics, onUpdateFlip}) {
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
        setPickedUrl(null)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUrl, selectedIndex])

  return (
    <Flex>
      <Box css={margin(0, rem(40), 0)}>
        {pics.map((src, idx) => {
          const isCurrent = idx === selectedIndex

          let style = {}
          if (idx === 0) {
            style = {...style, ...borderRadius('top', rem(8))}
          }
          if (idx === pics.length - 1) {
            style = {...style, ...borderRadius('bottom', rem(8))}
          }
          if (isCurrent) {
            style = {
              ...style,
              border: `solid 2px ${theme.colors.primary}`,
              boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
            }
          }

          return (
            <FlipImage
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              src={src}
              size={120}
              style={style}
              onClick={() => {
                setSelectedIndex(idx)
              }}
            />
          )
        })}
      </Box>
      <Box>
        <ImageEditor src={pics[selectedIndex]} />
        <Flex
          justify="space-between"
          align="center"
          css={margin(rem(theme.spacings.medium16), 0, 0)}
        >
          <IconButton
            icon={<FiSearch />}
            onClick={() => {
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, 1)
            }}
          >
            Search on Google
          </IconButton>
          <Divider vertical />
          <Input
            type="file"
            accept="image/*"
            style={{border: 'none'}}
            onChange={handleUpload}
          />
        </Flex>
      </Box>
    </Flex>
  )
}

FlipPics.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  onUpdateFlip: PropTypes.func.isRequired,
}

export default FlipPics
