/* eslint-disable react/prop-types */
import React from 'react'
import NextLink from 'next/link'
import {
  SimpleGrid,
  Image,
  Text,
  Box,
  Flex,
  Menu,
  MenuButton,
  Icon,
  MenuItem,
  MenuList,
  PseudoBox,
  Button,
  RadioButtonGroup,
  Stack,
  useTheme,
  Heading,
  AspectRatioBox,
  Divider,
  CloseButton,
  IconButton,
  FormControl,
  Input,
  Textarea,
  Collapse,
  Link,
  MenuDivider,
  Alert,
  AlertIcon,
} from '@chakra-ui/core'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {useTranslation} from 'react-i18next'
import {useService} from '@xstate/react'
import FlipEditor from './components/flip-editor'
import {Step} from './types'
import {formatKeywords} from './utils'
import {PrimaryButton, IconButton2} from '../../shared/components/button'
import {rem} from '../../shared/theme'
import {capitalize} from '../../shared/utils/string'
import {reorder} from '../../shared/utils/arr'
import {FlipType} from '../../shared/types'
import {
  Tooltip,
  Drawer,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  GoogleTranslateButton,
  PageTitle,
} from '../../shared/components/components'

export function FlipPageTitle({onClose, ...props}) {
  return (
    <Flex align="center" alignSelf="stretch" justify="space-between" my={6}>
      <PageTitle mb={0} {...props} />
      <CloseButton onClick={onClose} />
    </Flex>
  )
}

export function FlipCardList(props) {
  return <SimpleGrid columns={4} spacing={10} {...props} />
}

export function FlipCard({flipService, onDelete}) {
  const {t} = useTranslation()

  const [current, send] = useService(flipService)
  const {
    id,
    keywords,
    originalOrder,
    images,
    type,
    createdAt,
    modifiedAt = createdAt,
  } = current.context

  const {colors} = useTheme()

  const isActionable = [
    FlipType.Published,
    FlipType.Draft,
    FlipType.Archived,
    FlipType.Invalid,
  ].includes(type)
  const isSubmittable = [FlipType.Draft, FlipType.Invalid].includes(type)
  const isViewable = [FlipType.Published, FlipType.Archived].includes(type)
  const isEditable = [FlipType.Draft, FlipType.Invalid].includes(type)
  const isDeletable = [FlipType.Published, FlipType.Draft].includes(type)

  return (
    <Box position="relative">
      <FlipCardImageBox>
        {[FlipType.Publishing, FlipType.Deleting, FlipType.Invalid].some(
          x => x === type
        ) && (
          <FlipOverlay
            backgroundImage={
              // eslint-disable-next-line no-nested-ternary
              [FlipType.Publishing, FlipType.Deleting].some(x => x === type)
                ? `linear-gradient(to top, ${colors.warning[500]}, transparent)`
                : type === FlipType.Invalid
                ? `linear-gradient(to top, ${colors.red[500]}, transparent)`
                : ''
            }
          >
            <FlipOverlayStatus>
              <FlipOverlayIcon name="info-solid" />
              <FlipOverlayText>
                {type === FlipType.Publishing && t('Mining...')}
                {type === FlipType.Deleting && t('Deleting...')}
                {type === FlipType.Invalid && t('Mining error')}
              </FlipOverlayText>
            </FlipOverlayStatus>
          </FlipOverlay>
        )}
        <FlipCardImage src={images[originalOrder ? originalOrder[0] : 0]} />
      </FlipCardImageBox>
      <Flex justifyContent="space-between" alignItems="flex-start" mt={4}>
        <Box>
          <FlipCardTitle>
            {keywords.words && keywords.words.length
              ? formatKeywords(keywords.words)
              : t('Missing keywords')}
          </FlipCardTitle>
          <FlipCardSubtitle>
            {new Date(modifiedAt).toLocaleString()}
          </FlipCardSubtitle>
        </Box>
        {isActionable && (
          <FlipCardMenu>
            {isSubmittable && (
              <FlipCardMenuItem onClick={() => send('PUBLISH', {id})}>
                <FlipCardMenuItemIcon name="upload" size={5} mr={2} />
                {t('Submit flip')}
              </FlipCardMenuItem>
            )}
            {isViewable && (
              <FlipCardMenuItem>
                <NextLink href={`/flips/view?id=${id}`}>
                  <Flex>
                    <FlipCardMenuItemIcon name="view" size={5} mr={2} />
                    {t('View flip')}
                  </Flex>
                </NextLink>
              </FlipCardMenuItem>
            )}
            {isEditable && (
              <FlipCardMenuItem>
                <NextLink href={`/flips/edit?id=${id}`}>
                  <Flex>
                    <FlipCardMenuItemIcon name="edit" size={5} mr={2} />
                    {t('Edit flip')}
                  </Flex>
                </NextLink>
              </FlipCardMenuItem>
            )}
            {(isSubmittable || isEditable) && isDeletable && (
              <MenuDivider color="gray.300" my={2} width={rem(145)} />
            )}

            {isDeletable && (
              <FlipCardMenuItem onClick={onDelete}>
                <FlipCardMenuItemIcon
                  name="delete"
                  size={5}
                  mr={2}
                  color="red.500"
                />
                {t('Delete flip')}
              </FlipCardMenuItem>
            )}
          </FlipCardMenu>
        )}
      </Flex>
    </Box>
  )
}

export function FlipCardImage(props) {
  return (
    <Image
      objectFit="cover"
      borderWidth="1px"
      borderColor="brandGray.016"
      // boxShadow={`0 0 0 1px ${colors.brandGray['016']}`}
      rounded="lg"
      height="full"
      {...props}
    />
  )
}

export function FlipCardImageBox({children, ...props}) {
  return (
    <AspectRatioBox h={150} w={150} position="relative" {...props}>
      <Box>{children}</Box>
    </AspectRatioBox>
  )
}

export function FlipCardTitle(props) {
  return <Text fontWeight={500} mb="px" {...props} />
}

export function FlipCardSubtitle(props) {
  return <Text color="muted" {...props} />
}

export function FlipCardMenu(props) {
  return (
    <Menu autoSelect={false}>
      <MenuButton
        rounded="md"
        py="3/2"
        px="2px"
        mt="-6px"
        _expanded={{bg: 'gray.50'}}
        _focus={{outline: 0}}
      >
        <Icon name="more" size={5} />
      </MenuButton>
      <MenuList
        placement="bottom-end"
        border="none"
        shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
        rounded="lg"
        py={2}
        minWidth="145px"
        {...props}
      />
    </Menu>
  )
}

export function FlipCardMenuItem(props) {
  return (
    <PseudoBox
      as={MenuItem}
      color="brandGray.500"
      fontWeight={500}
      px={3}
      py="3/2"
      _hover={{bg: 'gray.50'}}
      _focus={{bg: 'gray.50'}}
      _selected={{bg: 'gray.50'}}
      _active={{bg: 'gray.50'}}
      {...props}
    />
  )
}

export function FlipCardMenuItemIcon(props) {
  return <Icon size={5} mr={3} color="blue.500" {...props} />
}

export function RequiredFlipPlaceholder({title}) {
  const {t} = useTranslation()
  return (
    <Box cursor="pointer">
      <NextLink href="/flips/new" passHref>
        <Link display="inline-block" _hover={null}>
          <EmptyFlipBox>
            <FlipPlaceholder />
          </EmptyFlipBox>
        </Link>
      </NextLink>
      <Box mt={4}>
        <FlipCardTitle>{title}</FlipCardTitle>
        <FlipCardSubtitle>{t('Required')}</FlipCardSubtitle>
      </Box>
    </Box>
  )
}

export function OptionalFlipPlaceholder({title, isDisabled}) {
  const {t} = useTranslation()
  return (
    <Box
      cursor={isDisabled ? 'pointer' : 'auto'}
      opacity={isDisabled ? 0.5 : 1}
    >
      {isDisabled ? (
        <EmptyFlipBox>
          <Tooltip
            label={t('Create required flips first')}
            shouldWrapChildren
            placement="bottom"
          >
            <FlipPlaceholder />
          </Tooltip>
        </EmptyFlipBox>
      ) : (
        <NextLink href="/flips/new" passHref>
          <Link display="inline-block" _hover={null}>
            <EmptyFlipBox>
              <FlipPlaceholder />
            </EmptyFlipBox>
          </Link>
        </NextLink>
      )}
      <Box mt={4}>
        <FlipCardTitle>{title}</FlipCardTitle>
        <FlipCardSubtitle>{t('Optional')}</FlipCardSubtitle>
      </Box>
    </Box>
  )
}

export function EmptyFlipBox(props) {
  return (
    <PseudoBox
      animation="pulse 1s"
      display="flex"
      justifyContent="center"
      alignItems="center"
      borderWidth={2}
      borderColor="rgb(210, 212, 217)"
      borderStyle="dashed"
      color="rgb(210, 212, 217)"
      h={150}
      w={150}
      rounded="lg"
      transition="all 0.3s ease"
      _hover={{color: 'brand.blue'}}
      {...props}
    />
  )
}

export function FlipPlaceholder(props) {
  return <Icon name="plus-solid" size={8} {...props} />
}

export function FlipOverlay(props) {
  return (
    <Flex
      rounded="lg"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={99}
      {...props}
    />
  )
}

export function FlipOverlayStatus(props) {
  return (
    <Stack
      isInline
      spacing={1}
      align="center"
      color="white"
      fontWeight={500}
      mt="auto"
      ml={2}
      mb={2}
      {...props}
    />
  )
}

export function FlipOverlayIcon(props) {
  return <Icon size={5} {...props} />
}

export function FlipOverlayText(props) {
  return <Text fontWeight={500} {...props} />
}

export function FlipFilter(props) {
  return <RadioButtonGroup isInline spacing={2} {...props} />
}

export const FlipFilterOption = React.forwardRef(
  ({isChecked, ...props}, ref) => (
    <Button
      ref={ref}
      isActive={isChecked}
      aria-checked={isChecked}
      role="radio"
      bg="white"
      color="muted"
      fontWeight={500}
      size="sm"
      fontSize="md"
      _active={{bg: 'gray.50', color: 'brand.blue'}}
      _hover={{bg: 'gray.50', color: 'brand.blue'}}
      {...props}
    />
  )
)
FlipFilterOption.displayName = 'FlipFilterOption'

export function FlipMaster({children}) {
  return children
}

export function FlipMasterNavbar(props) {
  return (
    <Stack
      isInline
      align="center"
      alignSelf="stretch"
      spacing={8}
      bg="gray.50"
      minH={12}
      fontWeight={500}
      mx={-20}
      mb={6}
      px={20}
      {...props}
    />
  )
}

export function FlipMasterNavbarItem({step, ...props}) {
  return (
    <Stack role="group" isInline spacing={2} align="center" {...props}>
      <FlipMasterNavbarItemIcon step={step} />
      <FlipMasterNavbarItemText step={step} {...props} />
    </Stack>
  )
}

function FlipMasterNavbarItemIcon({step, ...props}) {
  return (
    <PseudoBox
      as={Flex}
      justifyContent="center"
      alignItems="center"
      bg={
        // eslint-disable-next-line no-nested-ternary
        step === Step.Active
          ? 'brandBlue.10'
          : step === Step.Completed
          ? 'brandBlue.500'
          : 'transparent'
      }
      border="2px"
      borderColor={step === Step.Next ? '#d2d4d9' : 'brandBlue.500'}
      color="white"
      rounded="full"
      w={4}
      h={4}
      transition="all 0.2s ease"
      {...props}
    >
      <Icon
        name="ok"
        size={3}
        opacity={step === Step.Completed ? 1 : 0}
        transition="all 0.2s ease"
      />
    </PseudoBox>
  )
}

export function FlipMasterNavbarItemText({step, ...props}) {
  let color = 'brand.gray'

  switch (step) {
    default:
    case Step.Next:
      color = 'muted'
      break
    case Step.Completed:
    case Step.Active:
      color = 'brand.gray'
      break
  }

  return (
    <PseudoBox as={Text} color={color} transition="all 0.3s ease" {...props} />
  )
}

export function FlipStoryStep({children}) {
  const {t} = useTranslation()
  return (
    <FlipStep>
      <FlipStepHeader mb={8}>
        <FlipStepTitle>{t('Think up a story')}</FlipStepTitle>
        <FlipStepSubtitle>
          {t(
            `Think up a short story about someone/something related to the two key words below according to the template "Before — Something happens — After"`
          )}
        </FlipStepSubtitle>
      </FlipStepHeader>
      {children}
    </FlipStep>
  )
}

export function FlipKeywordTranslationSwitch({
  keywords,
  showTranslation,
  locale,
  onSwitchLocale,
  isInline = true,
}) {
  const hasBothTranslations =
    keywords.translations.reduce((acc, {length}) => acc + length, 0) > 1

  return (
    <Stack spacing={rem(30)}>
      <FlipKeywordPair isInline={isInline} spacing={isInline ? 10 : rem(15)}>
        {hasBothTranslations &&
          showTranslation &&
          keywords.translations.map(([{id, name, desc}]) => (
            <FlipKeyword key={id}>
              <FlipKeywordName>{name}</FlipKeywordName>
              <FlipKeywordDescription minH={10}>{desc}</FlipKeywordDescription>
            </FlipKeyword>
          ))}
        {showTranslation ||
          keywords.words.map(({id, name, desc}) => (
            <FlipKeyword key={id}>
              <FlipKeywordName>{name}</FlipKeywordName>
              <FlipKeywordDescription minH={10}>{desc}</FlipKeywordDescription>
            </FlipKeyword>
          ))}
      </FlipKeywordPair>

      <Stack isInline spacing={1} align="center">
        {hasBothTranslations && (
          <IconButton2
            icon="switch"
            _hover={{background: 'transparent'}}
            onClick={onSwitchLocale}
          >
            {showTranslation ? 'EN' : (locale || '').toUpperCase()}
          </IconButton2>
        )}
        {showTranslation || (
          <>
            {hasBothTranslations ? (
              <Divider
                orientation="vertical"
                borderColor="gray.300"
                m={0}
                h={rem(24)}
              />
            ) : null}
            <GoogleTranslateButton
              phrases={keywords.words.map(({name, desc}) => `${name}\n${desc}`)}
              locale={locale}
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}

export function FlipKeywordPanel(props) {
  return (
    <Box bg="gray.50" px={10} py={8} rounded="lg" w="480px" {...props}></Box>
  )
}

export function FlipKeywordPair(props) {
  return <Stack isInline spacing={10} {...props} />
}

export function FlipKeyword(props) {
  return <Stack spacing="1/2" flex={1} {...props}></Stack>
}

export function FlipKeywordName({children, ...props}) {
  return (
    <Text fontWeight={500} {...props}>
      {children && typeof children === 'string'
        ? capitalize(children)
        : children}
    </Text>
  )
}
export function FlipKeywordDescription({children, ...props}) {
  return (
    <Text color="muted" {...props}>
      {children && typeof children === 'string'
        ? capitalize(children)
        : children}
    </Text>
  )
}

export function FlipStoryAside(props) {
  return <Stack spacing={1} {...props}></Stack>
}

export function FlipEditorStep({
  keywords,
  showTranslation,
  originalOrder,
  images,
  onChangeImage,
  onChangeOriginalOrder,
  onPainting,
}) {
  const {t} = useTranslation()

  const [currentIndex, setCurrentIdx] = React.useState(0)

  const {words, translations} = keywords

  const hasBothTranslations = translations.reduce(
    (acc, {length}) => !!length && acc,
    true
  )

  return (
    <FlipStep>
      <FlipStepHeader>
        <FlipStepTitle>{t('Select 4 images to tell your story')}</FlipStepTitle>
        <FlipStepSubtitle>
          {t(`Use keywords for the story`)}{' '}
          <Text as="mark">
            {formatKeywords(
              hasBothTranslations && showTranslation
                ? translations.map(([{name, desc}]) => ({
                    name,
                    desc,
                  }))
                : words
            )}
          </Text>{' '}
          {t(`and template "Before
          – Something happens – After"`)}
          .
        </FlipStepSubtitle>
      </FlipStepHeader>
      <Stack isInline spacing={10}>
        <FlipImageList>
          <DragDropContext
            onDragEnd={result => {
              if (
                result.destination &&
                result.destination.index !== result.source.index
              ) {
                setCurrentIdx(result.destination.index)

                onChangeOriginalOrder(
                  reorder(
                    originalOrder,
                    result.source.index,
                    result.destination.index
                  )
                )
              }
            }}
          >
            <Droppable droppableId="flip-editor">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {originalOrder.map((num, idx) => (
                    <DraggableItem
                      key={num}
                      draggableId={`image-${num}`}
                      index={idx}
                    >
                      <SelectableItem
                        isActive={idx === currentIndex}
                        isFirst={idx === 0}
                        isLast={idx === images.length - 1}
                        onClick={() => setCurrentIdx(idx)}
                      >
                        <FlipImageListItem
                          isFirst={idx === 0}
                          isLast={idx === images.length - 1}
                          src={images[num]}
                        />
                      </SelectableItem>
                    </DraggableItem>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </FlipImageList>
        <Box>
          {originalOrder.map((num, idx) => (
            <FlipEditor
              key={num}
              idx={num}
              visible={currentIndex === idx}
              src={images[num]}
              onChange={url => {
                onChangeImage(url, num)
              }}
              onChanging={onPainting}
            />
          ))}
        </Box>
      </Stack>
    </FlipStep>
  )
}

export function FlipEditorIcon(props) {
  return (
    <PseudoBox
      as={Icon}
      size={5}
      _hover={{color: 'brandBlue.500'}}
      {...props}
    />
  )
}

export function FlipShuffleStep({
  images,
  originalOrder,
  order,
  onShuffle,
  onManualShuffle,
  onReset,
}) {
  const {t} = useTranslation()
  return (
    <FlipStep alignSelf="stretch">
      <FlipStepHeader>
        <FlipStepTitle>{t('Shuffle images')}</FlipStepTitle>
        <FlipStepSubtitle>
          {t('Shuffle images in order to make a nonsense sequence of images')}
        </FlipStepSubtitle>
      </FlipStepHeader>
      <Stack isInline spacing={10} align="center" mx="auto">
        <Stack isInline spacing={10} justify="center">
          <FlipImageList>
            {originalOrder.map((num, idx) => (
              <FlipImageListItem
                key={num}
                src={images[num]}
                isFirst={idx === 0}
                isLast={idx === images.length - 1}
                opacity={0.3}
              />
            ))}
          </FlipImageList>
          <FlipImageList>
            <DragDropContext
              onDragEnd={result => {
                if (
                  result.destination &&
                  result.destination.index !== result.source.index
                ) {
                  onManualShuffle(
                    reorder(
                      order,
                      result.source.index,
                      result.destination.index
                    )
                  )
                }
              }}
            >
              <Droppable droppableId="flip-shuffle">
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {order.map((num, idx) => (
                      <DraggableItem
                        key={num}
                        draggableId={`pic-${num}`}
                        index={idx}
                      >
                        <Box position="relative">
                          <Flex
                            align="center"
                            justify="center"
                            bg="brandGray.080"
                            size={8}
                            rounded="md"
                            position="absolute"
                            top={1}
                            right={1}
                            zIndex={1}
                          >
                            <Icon name="move" size={5} color="white" />
                          </Flex>
                          <FlipImageListItem
                            isFirst={idx === 0}
                            isLast={idx === images.length - 1}
                            src={images[num]}
                          />
                        </Box>
                      </DraggableItem>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </FlipImageList>
        </Stack>
        <Stack spacing={1}>
          <IconButton2 icon="cycle" onClick={onShuffle}>
            {t('Shuffle images')}
          </IconButton2>
          <IconButton2 icon="undo" onClick={onReset}>
            {t('Reset to default')}
          </IconButton2>
        </Stack>
      </Stack>
    </FlipStep>
  )
}

export function FlipSubmitStep({
  keywords,
  showTranslation,
  locale,
  onSwitchLocale,
  originalOrder,
  order,
  images,
}) {
  const {t} = useTranslation()
  return (
    <FlipStep alignSelf="stretch">
      <FlipStepHeader>
        <FlipStepTitle>{t('Submit flip')}</FlipStepTitle>
        <FlipStepSubtitle>
          {t(
            'Make sure it is not possible to read the shuffled images as a meaningful story'
          )}
        </FlipStepSubtitle>
      </FlipStepHeader>
      <FlipStepBody minH="180px">
        <Stack isInline spacing={10}>
          <FlipKeywordPanel w={rem(320)}>
            {keywords.words.length ? (
              <FlipKeywordTranslationSwitch
                keywords={keywords}
                showTranslation={showTranslation}
                locale={locale}
                onSwitchLocale={onSwitchLocale}
                isInline={false}
              />
            ) : (
              <FlipKeyword>
                <FlipKeywordName>{t('Missing keywords')}</FlipKeywordName>
              </FlipKeyword>
            )}
          </FlipKeywordPanel>
          <Stack isInline spacing={10} justify="center">
            <FlipImageList>
              {originalOrder.map((num, idx) => (
                <FlipImageListItem
                  key={num}
                  src={images[num]}
                  isFirst={idx === 0}
                  isLast={idx === images.length - 1}
                />
              ))}
            </FlipImageList>
            <FlipImageList>
              {order.map((num, idx) => (
                <FlipImageListItem
                  key={num}
                  src={images[num]}
                  isFirst={idx === 0}
                  isLast={idx === images.length - 1}
                />
              ))}
            </FlipImageList>
          </Stack>
        </Stack>
      </FlipStepBody>
    </FlipStep>
  )
}

export function FlipStep(props) {
  return <Flex direction="column" flex={1} {...props} />
}

export function FlipStepHeader(props) {
  return <Box mb={6} {...props} />
}

export function FlipStepTitle(props) {
  return <Heading as="h2" fontSize="lg" fontWeight={500} mb={1} {...props} />
}

export function FlipStepSubtitle(props) {
  return <Text color="muted" {...props} />
}

export function FlipStepBody(props) {
  return <Stack isInline spacing={10} {...props} />
}

export function FlipMasterFooter(props) {
  return (
    <Box
      alignSelf="stretch"
      borderTop="1px"
      borderTopColor="gray.300"
      mt="auto"
      px={4}
      py={3}
    >
      <Stack isInline spacing={2} justify="flex-end" {...props} />
    </Box>
  )
}

export function FlipImageList(props) {
  return <Stack spacing={0} {...props} />
}

function SelectableItem({isActive, isFirst, isLast, ...props}) {
  const {colors} = useTheme()
  return (
    <PseudoBox
      position="relative"
      _before={{
        content: `""`,
        roundedTop: isFirst ? 'md' : 0,
        roundedBottom: isLast ? 'md' : 0,
        boxShadow: isActive
          ? `0 0 0 4px ${colors.brandBlue['025']}, inset 0 0 0 2px ${colors.brandBlue['500']}`
          : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: isActive ? 'docked' : 'base',
      }}
      {...props}
    />
  )
}

function DraggableItem({draggableId, index, ...props}) {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          {...props}
        />
      )}
    </Draggable>
  )
}

export function FlipImageListItem({isFirst, isLast, ...props}) {
  return (
    <FlipImage
      roundedTop={isFirst ? 'md' : 0}
      roundedBottom={isLast ? 'md' : 0}
      borderBottomWidth={isLast ? '1px' : 0}
      width={120}
      {...props}
    />
  )
}

export function FlipImage({
  src,
  objectFit = 'scale-down',
  roundedTop,
  roundedBottom,
  ...props
}) {
  return (
    <AspectRatioBox
      ratio={4 / 3}
      bg="gray.50"
      border="1px"
      borderColor="brandGray.016"
      roundedTop={roundedTop}
      roundedBottom={roundedBottom}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          objectFit={objectFit}
          fallbackSrc="/static/flips-cant-icn.svg"
          roundedTop={roundedTop}
          roundedBottom={roundedBottom}
        />
      ) : (
        <EmptyFlipImage />
      )}
    </AspectRatioBox>
  )
}

export function EmptyFlipImage(props) {
  return (
    <Flex align="center" justify="center" px={10} py={6} {...props}>
      <Icon name="pic" size={10} color="gray.100" />
    </Flex>
  )
}

export function CommunityTranslations({
  keywords,
  isOpen,
  isPending,
  onVote,
  onSuggest,
  onToggle,
}) {
  const {t} = useTranslation()

  const [wordIdx, setWordIdx] = React.useState(0)

  const [
    descriptionCharactersCount,
    setDescriptionCharactersCount,
  ] = React.useState(150)

  const translations = keywords.translations[wordIdx]

  const lastTranslationId =
    translations && translations.length
      ? translations[translations.length - 1].id
      : wordIdx

  return (
    <Stack spacing={isOpen ? 8 : 0}>
      <IconButton2
        icon="community"
        color="brandGray.500"
        px={0}
        _hover={{background: 'transparent'}}
        onClick={onToggle}
      >
        {t('Community translation')}
        <Icon size={5} name="chevron-down" color="muted" ml={2}></Icon>
      </IconButton2>
      <Collapse isOpen={isOpen}>
        <Stack spacing={8}>
          <RadioButtonGroup isInline value={wordIdx} onChange={setWordIdx}>
            {keywords.words.map(({id, name}, i) => (
              <FlipKeywordRadio key={id} value={i}>
                {name && capitalize(name)}
              </FlipKeywordRadio>
            ))}
          </RadioButtonGroup>
          {translations.map(({id, name, desc, score}) => (
            <Flex key={id} justify="space-between">
              <FlipKeyword>
                <FlipKeywordName>{name}</FlipKeywordName>
                <FlipKeywordDescription>{desc}</FlipKeywordDescription>
              </FlipKeyword>
              <Stack isInline spacing={2} align="center">
                <VoteButton
                  icon="upvote"
                  onClick={() => onVote({id, up: true})}
                />
                <Flex
                  align="center"
                  justify="center"
                  bg={score < 0 ? 'red.010' : 'green.010'}
                  color={score < 0 ? 'red.500' : 'green.500'}
                  fontWeight={500}
                  rounded="md"
                  minW={12}
                  minH={8}
                  style={{fontVariantNumeric: 'tabular-nums'}}
                >
                  {score}
                </Flex>
                <VoteButton
                  icon="upvote"
                  color="muted"
                  transform="rotate(180deg)"
                  onClick={() => onVote({id, up: false})}
                />
              </Stack>
            </Flex>
          ))}

          {translations.length && <Divider borderColor="gray.300" />}

          <Box>
            <Text fontWeight={500} mb={3}>
              {t('Suggest translation')}
            </Text>
            <form
              key={lastTranslationId}
              onSubmit={e => {
                e.preventDefault()
                const {
                  nameInput: {value: name},
                  descInput: {value: desc},
                } = e.target.elements
                onSuggest({wordIdx, name, desc: desc.trim()})
              }}
            >
              <FormControl>
                <Input
                  id="nameInput"
                  placeholder={
                    keywords.words[wordIdx].name
                      ? capitalize(keywords.words[wordIdx].name)
                      : 'Name'
                  }
                  px={3}
                  pt="3/2"
                  pb={2}
                  borderColor="gray.300"
                  mb={2}
                  _placeholder={{
                    color: 'muted',
                  }}
                />
              </FormControl>
              <FormControl position="relative">
                <Textarea
                  id="descInput"
                  placeholder={
                    keywords.words[wordIdx].desc
                      ? capitalize(keywords.words[wordIdx].desc)
                      : 'Description'
                  }
                  borderColor="gray.300"
                  px={3}
                  pt="3/2"
                  pb={2}
                  mb={6}
                  _placeholder={{
                    color: 'muted',
                  }}
                  onChange={e =>
                    setDescriptionCharactersCount(150 - e.target.value.length)
                  }
                />
                <Box
                  color={descriptionCharactersCount < 0 ? 'red.500' : 'muted'}
                  fontSize="sm"
                  position="absolute"
                  right={2}
                  bottom={2}
                  zIndex="docked"
                >
                  {descriptionCharactersCount}
                </Box>
              </FormControl>
              <PrimaryButton
                type="submit"
                display="flex"
                ml="auto"
                isLoading={isPending}
              >
                {t('Send')}
              </PrimaryButton>
            </form>
          </Box>
        </Stack>
      </Collapse>
    </Stack>
  )
}

export const FlipKeywordRadio = React.forwardRef(
  ({isChecked, ...props}, ref) => {
    const stateProps = {
      bg: isChecked ? 'brandBlue.500' : 'transparent',
      color: isChecked ? 'white' : 'brandGray.500',
    }

    return (
      <PrimaryButton
        ref={ref}
        aria-checked={isChecked}
        role="radio"
        {...stateProps}
        _hover={{
          ...stateProps,
        }}
        _active={{
          ...stateProps,
        }}
        {...props}
      />
    )
  }
)
FlipKeywordRadio.displayName = 'FlipKeywordRadio'

export function VoteButton(props) {
  return (
    <IconButton
      bg="transparent"
      color="brandGray.500"
      fontSize={rem(20)}
      h={5}
      w={5}
      _hover={{bg: 'transparent'}}
      {...props}
    />
  )
}

export function CommunityTranslationUnavailable() {
  const {t} = useTranslation()
  return (
    <Box mt={4}>
      <Alert
        status="error"
        bg="red.010"
        borderWidth="1px"
        borderColor="red.050"
        fontWeight={500}
        rounded="md"
        px={3}
        py={2}
      >
        <AlertIcon name="info" color="red.500" size={5} mr={3} />
        {t('Community translation is not available')}
      </Alert>
    </Box>
  )
}

export function DeleteFlipDrawer({hash, cover, isMissing, onDelete, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Flex
          align="center"
          justify="center"
          bg="red.012"
          h={12}
          w={12}
          rounded="xl"
        >
          <Icon name="delete" size={6} color="red.500" />
        </Flex>
        <Heading fontSize="lg" fontWeight={500} color="brandGray.500" mt={4}>
          {t('Delete flip')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        {!isMissing && (
          <Text color="brandGray.500" fontSize="md">
            {t('Deleted flip will be moved to the drafts.')}
          </Text>
        )}
        <FlipImage
          src={cover}
          size={160}
          objectFit="cover"
          mx="auto"
          mt={8}
          mb={38}
          rounded="lg"
        />
        <FormControl mb={6}>
          <FormLabel htmlFor="hashInput" mb={2}>
            {t('Flip hash')}
          </FormLabel>
          <Input
            id="hashInput"
            h={8}
            borderColor="gray.300"
            lineHeight={rem(18)}
            px={3}
            pt="3/2"
            pb={2}
            mb={2}
            value={hash}
            isReadOnly
            _readOnly={{
              bg: 'gray.50',
              borderColor: 'gray.300',
              color: 'muted',
            }}
          />
        </FormControl>
        <PrimaryButton
          variantColor="red"
          display="flex"
          ml="auto"
          _hover={{
            bg: 'rgb(227 60 60)',
          }}
          onClick={onDelete}
        >
          Delete
        </PrimaryButton>
      </DrawerBody>
    </Drawer>
  )
}
