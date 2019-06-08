import React, {useState, useEffect} from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import {FiPlusSquare} from 'react-icons/fi'
import Layout from '../../components/layout'
import {Heading, Box} from '../../shared/components'
import theme from '../../shared/theme'
import FlipToolbar, {
  FlipToolbarItem,
} from '../../screens/flips/shared/components/toolbar'
import FlipList from '../../screens/flips/shared/components/flip-list'
import useFlips from '../../shared/utils/useFlips'
import useValidation from '../../shared/utils/useValidation'
import Flex from '../../shared/components/flex'
import IconLink from '../../shared/components/icon-link'
import FlipCover from '../../screens/flips/shared/components/flip-cover'
import FlipType from '../../screens/flips/shared/types/flip-type'

function Flips() {
  const {running: validationRunning} = useValidation()

  const [flipType, setFlipType] = useLocalStorage(
    'flips/filter',
    FlipType.Published
  )
  const {flips, deleteFlip} = useFlips()
  const [filteredFlips, setFilteredFlips] = useState([])

  useEffect(() => {
    setFilteredFlips(flips.filter(flip => flip.type === flipType))
  }, [flipType, flips, setFilteredFlips])

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
                  setFlipType(type)
                }}
                isCurrent={flipType === type}
              >
                {type}
              </FlipToolbarItem>
            ))}
          </Flex>
          <Flex>
            {!validationRunning && (
              <IconLink href="/flips/new" icon={<FiPlusSquare />} first>
                Add flip
              </IconLink>
            )}
          </Flex>
        </FlipToolbar>
      </Box>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <FlipList>
          {filteredFlips.map(flip => (
            <FlipCover
              key={flip.id}
              {...flip}
              onDelete={() => {
                deleteFlip(flip)
              }}
            />
          ))}
        </FlipList>
      </Box>
    </Layout>
  )
}

export default Flips
