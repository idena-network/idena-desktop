import React, {useState, useEffect} from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import {FiPlusSquare} from 'react-icons/fi'
import {rem} from 'polished'
import Layout from '../../components/layout'
import {Heading, Box} from '../../shared/components'
import theme from '../../shared/theme'
import FlipToolbar, {
  FlipToolbarItem,
} from '../../screens/flips/shared/components/toolbar'
import FlipList from '../../screens/flips/shared/components/flip-list'
import useFlips from '../../shared/utils/useFlips'
import Flex from '../../shared/components/flex'
import IconLink from '../../shared/components/icon-link'
import FlipCover from '../../screens/flips/shared/components/flip-cover'
import FlipType from '../../screens/flips/shared/types/flip-type'

function Flips() {
  const {flips} = useFlips()

  const [filter, setFilter] = React.useState(FlipType.Published)
  const [filteredFlips, setFilteredFlips] = React.useState([])

  useEffect(() => {
    setFilteredFlips(flips.filter(({type}) => type === filter))
  }, [filter, flips])

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <Heading>My Flips</Heading>
        <FlipToolbar>
          <Flex>
            {Object.values(FlipType).map(type => (
              <FlipToolbarItem
                key={type}
                onClick={() => {
                  setFilter(type)
                }}
                isCurrent={filter === type}
              >
                {type}
              </FlipToolbarItem>
            ))}
          </Flex>
          <Flex>
            <IconLink href="/flips/new" icon={<FiPlusSquare />}>
              Add flip
            </IconLink>
          </Flex>
        </FlipToolbar>
      </Box>
      <Box my={rem(theme.spacings.medium32)} px={theme.spacings.xxxlarge}>
        <FlipList>
          {filteredFlips.map(flip => (
            <FlipCover key={flip.id} {...flip} width="25%" />
          ))}
        </FlipList>
      </Box>
    </Layout>
  )
}

export default Flips
