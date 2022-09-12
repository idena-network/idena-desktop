/* eslint-disable react/prop-types */
import React from 'react'
import {
  AspectRatio,
  Box,
  Image,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Machine} from 'xstate'
import {assign, log} from 'xstate/lib/actions'
import {PrimaryButton, SecondaryButton} from '../../../shared/components/button'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Input,
} from '../../../shared/components/components'
import {eitherState} from '../../../shared/utils/utils'
import {FillCenter} from '../../oracles/components'
import {SearchIcon} from '../../../shared/components/icons'

export function ImageSearchDialog({onPick, onClose, onError, ...props}) {
  const {t} = useTranslation()

  const searchInputRef = React.useRef()

  const [current, send] = useMachine(
    Machine({
      context: {
        images: [],
        query: '',
      },
      initial: 'idle',
      states: {
        idle: {},
        searching: {
          invoke: {
            // eslint-disable-next-line no-shadow
            src: ({query}) => global.ipcRenderer.invoke('search-image', query),
            onDone: {
              target: 'done',
              actions: [
                assign({
                  images: (_, {data}) => data,
                }),
                log(),
              ],
            },
            onError: 'fail',
          },
        },
        done: {
          on: {
            PICK: {
              actions: [
                assign({
                  selectedImage: (_, {image}) => image,
                }),
                log(),
              ],
            },
          },
        },
        fail: {
          entry: [(_, {data: {message}}) => onError(message), log()],
        },
      },
      on: {
        SEARCH: 'searching',
        TYPE: {
          actions: [
            assign({
              // eslint-disable-next-line no-shadow
              query: (_, {query}) => query,
            }),
          ],
        },
      },
    })
  )

  const {images, query, selectedImage} = current.context

  return (
    <Dialog
      size="38rem"
      initialFocusRef={searchInputRef}
      closeOnOverlayClick={false}
      onClose={onClose}
      {...props}
    >
      <DialogBody d="flex">
        <Stack minH="sm" maxH="sm" spacing={4} flex={1}>
          <Stack
            isInline
            as="form"
            onSubmit={e => {
              e.preventDefault()
              send('SEARCH')
            }}
          >
            <InputGroup w="full">
              <InputLeftElement w={5} h={5} top="3/2" left={3}>
                <SearchIcon boxSize="3" color="gray.100" />
              </InputLeftElement>
              <Input
                ref={searchInputRef}
                type="search"
                value={query}
                placeholder={t('Search the picture on the web')}
                bg="gray.50"
                pl={10}
                onChange={e => {
                  send('TYPE', {query: e.target.value})
                }}
              />
            </InputGroup>
            <PrimaryButton type="submit">Search</PrimaryButton>
          </Stack>
          {eitherState(current, 'idle') && (
            <FillCenter>
              <Stack spacing={4} align="center" w="3xs">
                <Box p={3}>
                  <SearchIcon boxSize="14" color="gray.300" />
                </Box>
                <Text color="muted" textAlign="center" w="full">
                  {t(
                    'Type your search in the box above to find images using search box'
                  )}
                </Text>
              </Stack>
            </FillCenter>
          )}
          {eitherState(current, 'done') && (
            <SimpleGrid columns={4} spacing={2} overflow="auto" mx={-6} px={6}>
              {images.map(({thumbnail, image}, idx) => (
                <AspectRatio
                  key={`${image}-${idx}`}
                  ratio={1}
                  w={32}
                  bg={thumbnail === selectedImage ? 'blue.032' : 'white'}
                  borderColor={
                    thumbnail === selectedImage ? 'blue.500' : 'gray.50'
                  }
                  borderWidth={1}
                  borderRadius="md"
                  overflow="hidden"
                  position="relative"
                  transition="all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                  onClick={() => {
                    send('PICK', {image: thumbnail})
                  }}
                  onDoubleClick={() => {
                    onPick(selectedImage)
                  }}
                >
                  <Image
                    src={thumbnail}
                    objectFit="contain"
                    objectPosition="center"
                    borderColor={
                      thumbnail === selectedImage ? 'blue.500' : 'transparent'
                    }
                    borderWidth={1}
                    borderRadius="md"
                  />
                </AspectRatio>
              ))}
            </SimpleGrid>
          )}
          {eitherState(current, 'searching') && (
            <FillCenter>
              <Spinner color="blue.500" />
            </FillCenter>
          )}
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton
          onClick={() => {
            onPick(selectedImage)
          }}
        >
          {t('Select')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
