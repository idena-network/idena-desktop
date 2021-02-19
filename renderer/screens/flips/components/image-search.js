/* eslint-disable react/prop-types */
import React from 'react'
import {
  AspectRatioBox,
  Box,
  Icon,
  IconButton,
  Image,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/core'
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

export function ImageSearchDialog({onClose, ...props}) {
  const {t} = useTranslation()

  const [current, send] = useMachine(
    Machine({
      context: {
        images: [],
      },
      initial: 'idle',
      states: {
        idle: {},
        searching: {
          invoke: {
            src: (_, {query}) =>
              global.ipcRenderer.invoke('search-image', query),
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
        fail: {},
      },
      on: {
        SEARCH: 'searching',
      },
    })
  )

  const {images, selectedImage} = current.context

  return (
    <Dialog size={440} onClose={onClose} {...props}>
      <DialogBody d="flex">
        <Stack minH="sm" maxH="sm" spacing={4} flex={1}>
          <Stack
            isInline
            as="form"
            onSubmit={e => {
              e.preventDefault()
              send('SEARCH', {query: e.target.elements.query.value})
            }}
          >
            <InputGroup w="full">
              <InputLeftElement w={5} h={5} top="3/2" left={3}>
                <IconButton
                  type="submit"
                  icon="search"
                  variant="ghost"
                  size={5}
                  w={5}
                  h={5}
                  _hover={{
                    bg: 'transparent',
                    boxShadow: 'none',
                  }}
                  _active={{
                    bg: 'transparent',
                    boxShadow: 'none',
                  }}
                  _focus={{
                    boxShadow: 'none',
                  }}
                />
              </InputLeftElement>
              <Input
                type="search"
                id="query"
                placeholder={t('Search the picture on the web')}
                bg="gray.50"
                pl={10}
              />
            </InputGroup>
          </Stack>
          {eitherState(current, 'idle') && (
            <FillCenter>
              <Stack spacing={4} align="center" w="3xs">
                <Box p={3}>
                  <Icon name="search" size="56px" color="gray.300" />
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
            <SimpleGrid columns={4} spacing={2} overflow="auto" mx={-8} px={8}>
              {images.map(({image, thumbnail}) => (
                <AspectRatioBox
                  ratio={1}
                  w={88}
                  bg={image === selectedImage ? 'blue.032' : 'white'}
                  borderColor={image === selectedImage ? 'blue.500' : 'gray.50'}
                  borderWidth={1}
                  borderRadius="md"
                  overflow="hidden"
                  position="relative"
                  transition="all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                  onClick={() => {
                    send('PICK', {image})
                  }}
                >
                  <Image
                    src={thumbnail}
                    objectFit="contain"
                    objectPosition="center"
                    borderColor={
                      image === selectedImage ? 'blue.500' : 'transparent'
                    }
                    borderWidth={1}
                    borderRadius="md"
                  />
                </AspectRatioBox>
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
        <PrimaryButton>{t('Select')}</PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
