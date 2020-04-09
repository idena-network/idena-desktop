import React from 'react'
import {Box, Flex, Stack, Text, Divider, Icon} from '@chakra-ui/core'
import {FaBullhorn} from 'react-icons/fa'
import {FiMoreVertical} from 'react-icons/fi'
import {margin} from 'polished'
import dayjs from 'dayjs'
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
  AdDetails,
  TargetCondition,
  AdTargeting,
  SmallFigureLabel,
  SmallFigureNumber,
} from '../../screens/ads/components'
import {useAds} from '../../screens/ads/machine'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import {IconButton} from '../../shared/components/button'
import {rem} from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {SecondaryButton} from '../../shared/components'

export default function MyAds() {
  const [ads] = useAds()
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
                  .map(({burnt}) => burnt)
                  .reduce(add)
                  .toLocaleString()}{' '}
                DNA
              </FigureNumber>
            </Figure>
          </FigureGroup>
          <ToolbarButton ml="auto">
            <IconButton
              disabled={!hasPendingChanges}
              icon={<FaBullhorn size={rem(18)} />}
            >
              Publish
            </IconButton>
          </ToolbarButton>
          <ToolbarButton>
            <IconButton icon={<i className="icon icon--add_btn" />}>
              New banner
            </IconButton>
          </ToolbarButton>
        </Toolbar>
        <AdList spacing={4}>
          {ads.map(({imageUrl, title, burnt: spent, lastTx}) => (
            <AdEntry>
              <Flex>
                <AdImage
                  src={imageUrl || '//placekitten.com/60/60'}
                  alt={title}
                />
                <Box ml={5} w="100%">
                  <Flex>
                    <Text fontSize={rem(14)} fontWeight={500}>
                      {title}
                    </Text>
                    <Stack isInline align="center" spacing={4} ml="auto">
                      {/* <Icon name={FiMoreVertical}></Icon> */}
                      <Box>
                        <FiMoreVertical />
                      </Box>
                      <SecondaryButton>Pay</SecondaryButton>
                    </Stack>
                  </Flex>
                  <Stack isInline spacing={rem(58)}>
                    <Figure>
                      <FigureLabel>Spent, 4hrs</FigureLabel>
                      <FigureNumber fontSize={rem(13)}>{spent}</FigureNumber>
                    </Figure>
                    <Figure>
                      <FigureLabel>Total spent, DNA</FigureLabel>
                      <FigureNumber fontSize={rem(13)}>{spent}</FigureNumber>
                    </Figure>
                    <Figure>
                      <FigureLabel>Last tx</FigureLabel>
                      <FigureNumber fontSize={rem(13)}>
                        {lastTx.diff('s')}
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
          ))}
        </AdList>
      </Page>
    </Layout>
  )
}
