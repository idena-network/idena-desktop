/* eslint-disable react/prop-types */
import React from 'react'
import {Image, SimpleGrid, Stack, Text} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  IconButton2,
  PrimaryButton,
  SecondaryButton,
} from '../../../shared/components/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
} from '../../../shared/components/components'

export function ImageSearchDialog(props) {
  const {t} = useTranslation()

  const [imageSearchResults, setImageSearchResults] = React.useState([])

  return (
    <Dialog size="md" {...props}>
      <DialogHeader>Search on the web</DialogHeader>
      <DialogBody minH="sm">
        <Stack spacing={4}>
          <Stack
            isInline
            as="form"
            onSubmit={e => {
              e.preventDefault()
              global.ipcRenderer
                .invoke('search-image', e.target.elements.query.value)
                .then(result => {
                  setImageSearchResults(result)
                })
            }}
          >
            <Input type="search" id="query" />
            <IconButton2 icon="search" type="submit" />
          </Stack>
          {imageSearchResults.length < 1 && (
            <Text color="muted" fontSize="sm" w="full">
              Put search query and hit enter
            </Text>
          )}
          <SimpleGrid columns={4} spacing={4}>
            {imageSearchResults.slice(0, 10).map(({thumbnail}) => (
              <Image src={thumbnail} />
            ))}
          </SimpleGrid>
        </Stack>
      </DialogBody>
      <DialogFooter>
        {/* eslint-disable-next-line react/destructuring-assignment */}
        <SecondaryButton onClick={props.onClose}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton>{t('Select')}</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
