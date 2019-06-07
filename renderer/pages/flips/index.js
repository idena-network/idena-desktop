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

function Flips() {
  const {flips, types} = useFlips()
  const [filter, setFilter] = useLocalStorage('flips/filter', types.published)
  const {running: validationRunning} = useValidation()
  const [filteredFlips, setFilteredFlips] = useState()

  useEffect(() => {
    setFilteredFlips(flips.filter(flip => flip.type === filter))
  }, [filter, flips])

  const flipTypes = Object.keys(types)

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <Heading>My Flips</Heading>
        <FlipToolbar>
          <Flex>
            {flipTypes.map(type => (
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
            {!validationRunning && (
              <IconLink href="/flips/new" icon={<FiPlusSquare />} first>
                Add flip
              </IconLink>
            )}
          </Flex>
        </FlipToolbar>
      </Box>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <FlipList flips={filteredFlips} onUpdateFlips={setFilteredFlips} />
      </Box>
    </Layout>
  )
}

export default Flips
