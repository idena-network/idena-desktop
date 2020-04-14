import React from 'react'
import {Box, Flex, Stack, Text, Divider} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {FiMoreVertical} from 'react-icons/fi'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {linearGradient, transparentize, cover} from 'polished'
import {
  AdList,
  AdEntry,
  Toolbar,
  ToolbarButton,
  Figure,
  FigureLabel,
  FigureNumber,
  AdImage,
  FigureGroup,
  AdEntryDivider,
  AdTargeting,
  SmallFigureLabel,
  SmallFigureNumber,
} from '../../screens/ads/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import {rem} from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {SecondaryButton, IconButton} from '../../shared/components'
import {adsMachine} from '../../screens/ads/machine'
import {loadAds, AdStatus, adStatusColor, toDna} from '../../screens/ads/utils'
import {persistState} from '../../shared/utils/persist'

export default function MyAds() {
  const [
    {
      context: {ads},
    },
    send,
  ] = useMachine(
    adsMachine.withConfig(
      {
        actions: {
          // eslint-disable-next-line no-shadow
          persist: ({ads}) => {
            persistState('ads', ads)
          },
        },
      },
      {
        ads: loadAds(),
      }
    )
  )
  const {balance} = useIdentityState()

  const hasPendingChanges = ads.some(({burnt}) => burnt <= 0)

  return (
    <Layout>
      <Page>
        <PageTitle>My Ads</PageTitle>
        <Toolbar>
          <FigureGroup>
            <Figure mr={rem(84)}>
              <FigureLabel>My balance</FigureLabel>
              <FigureNumber>{(balance || 0).toLocaleString()} DNA</FigureNumber>
            </Figure>
            <Figure>
              <FigureLabel>Total spent, 4hrs</FigureLabel>
              <FigureNumber>
                {ads
                  .map(({burnt}) => burnt || 0)
                  .reduce(add, 0)
                  .toLocaleString()}{' '}
                DNA
              </FigureNumber>
            </Figure>
          </FigureGroup>
          <ToolbarButton ml="auto">
            <IconButton disabled={!hasPendingChanges} icon="publish">
              Publish
            </IconButton>
          </ToolbarButton>
          <ToolbarButton>
            <NextLink href="/ads/new">
              <IconButton icon="plus-solid">New banner</IconButton>
            </NextLink>
          </ToolbarButton>
        </Toolbar>
        <AdList spacing={4}>
          {ads.map(
            ({
              cover: adCover,
              title,
              burnt: spent = 0,
              lastTx = dayjs(),
              status = AdStatus.NotShowing,
            }) => (
              <AdEntry key={title}>
                <Flex>
                  <Box w={rem(60)}>
                    <Box mb={3} position="relative">
                      <AdImage
                        src={adCover || '//placekitten.com/60/60'}
                        alt={title}
                        {...linearGradient({
                          colorStops: [
                            adStatusColor(status),
                            transparentize(0.84, adStatusColor(status)),
                          ],
                          fallback: 'none',
                          toDirection: 'to top',
                        })}
                      ></AdImage>
                      <Box
                        rounded="lg"
                        {...cover()}
                        {...linearGradient({
                          colorStops: [
                            adStatusColor(status),
                            transparentize(0.84, adStatusColor(status)),
                          ],
                          fallback: 'none',
                          toDirection: 'to top',
                        })}
                      ></Box>
                    </Box>
                    <Text
                      color={adStatusColor(status)}
                      fontWeight={500}
                      wordBreak="break-word"
                    >
                      {status}
                    </Text>
                  </Box>
                  <Box ml={5} flex={1}>
                    <Flex>
                      <Text fontSize={rem(14)} fontWeight={500}>
                        {title}
                      </Text>
                      <Stack isInline align="center" spacing={4} ml="auto">
                        <Box>
                          <FiMoreVertical />
                        </Box>
                        <SecondaryButton>Pay</SecondaryButton>
                      </Stack>
                    </Flex>
                    <Stack isInline spacing={rem(58)}>
                      <Figure>
                        <FigureLabel>Spent, 4hrs</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {toDna(spent)}
                        </FigureNumber>
                      </Figure>
                      <Figure>
                        <FigureLabel>Total spent, DNA</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {toDna(spent)}
                        </FigureNumber>
                      </Figure>
                      <Figure>
                        <FigureLabel>Last tx</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {dayjs().diff(lastTx, 'ms')} ms ago
                        </FigureNumber>
                      </Figure>
                    </Stack>
                    <AdTargeting>
                      <Stack isInline spacing={2}>
                        <Box>
                          <SmallFigureLabel>Location</SmallFigureLabel>
                          <SmallFigureLabel>Language</SmallFigureLabel>
                          <SmallFigureLabel>Stake</SmallFigureLabel>
                        </Box>
                        <Box>
                          <SmallFigureNumber>USA</SmallFigureNumber>
                          <SmallFigureNumber>en</SmallFigureNumber>
                          <SmallFigureNumber>>1000</SmallFigureNumber>
                        </Box>
                      </Stack>
                      <Stack isInline spacing={2}>
                        <Box>
                          <SmallFigureLabel>Age</SmallFigureLabel>
                          <SmallFigureLabel>OS</SmallFigureLabel>
                        </Box>
                        <Box>
                          <SmallFigureNumber>>10</SmallFigureNumber>
                          <SmallFigureNumber>macOS</SmallFigureNumber>
                        </Box>
                      </Stack>
                      <Divider
                        borderColor="gray.100"
                        border="1px"
                        orientation="vertical"
                        opacity={1}
                      ></Divider>
                      <Box ml={4}>
                        <Stack isInline spacing={2}>
                          <Box>
                            <FigureLabel>Competitors</FigureLabel>
                            <FigureLabel>Max price</FigureLabel>
                          </Box>
                          <Box>
                            <FigureNumber fontSize={rem(13)} fontWeight={500}>
                              1
                            </FigureNumber>
                            <FigureNumber fontSize={rem(13)} fontWeight={500}>
                              0.000000000123 DNA
                            </FigureNumber>
                          </Box>
                        </Stack>
                      </Box>
                    </AdTargeting>
                  </Box>
                </Flex>
                {/* <Menu>
                      <MenuButton
                        style={{
                          backgroundColor: 'none',
                          border: 'none',
                        }}
                      >
                        <FiMoreVertical size={rem(20)} />
                      </MenuButton>
                      <MenuList
                        style={{
                          ...backgrounds(theme.colors.white),
                          ...borderRadius('top', rem(4)),
                          ...borderRadius('bottom', rem(4)),
                          boxShadow:
                            '0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)',
                          ...padding(rem(8), 0),
                          width: rem(180),
                        }}
                      >
                        <AdRowMenuItem>
                          <AdRowMenuIcon icon={FiEdit} />
                          Edit
                        </AdRowMenuItem>
                        <AdRowMenuItem>
                          <AdRowMenuIcon icon={FiPause} />
                          Disable
                        </AdRowMenuItem>
                        <AdRowMenuItem as={Divider} />
                        <AdRowMenuItem variant="danger">
                          <AdRowMenuIcon icon={FiDelete} variant="danger" />
                          Delete
                        </AdRowMenuItem>
                      </MenuList>
                    </Menu> */}
                <AdEntryDivider />
              </AdEntry>
            )
          )}
        </AdList>
      </Page>
    </Layout>
  )
}
