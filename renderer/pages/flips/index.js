import React, {useState, useEffect} from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import Layout from '../../components/layout'
import {Heading, Box} from '../../shared/components'
import theme from '../../shared/theme'
import FlipToolbar from '../../screens/flips/shared/components/toolbar'
import FlipList from '../../screens/flips/shared/components/flip-list'
import useFlips from '../../shared/utils/useFlips'
import useValidation from '../../shared/utils/useValidation'
// import useIdentity from '../../shared/utils/useIdentity'

function Flips() {
  const {flips, types} = useFlips()
  const [filter, setFilter] = useLocalStorage('flips/filter', types.published)
  const [filteredFlips, setFilteredFlips] = useState()

  const {running: validationRunning} = useValidation()
  // const {requiredFlips} = useIdentity()

  useEffect(() => {
    setFilteredFlips(flips.filter(flip => flip.type === filter))
  }, [filter, flips])

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <Heading>My Flips</Heading>
        <Box css={{marginBottom: theme.spacings.large}}>
          <FlipToolbar
            filters={Object.keys(types)}
            activeFilter={filter}
            onFilter={setFilter}
            shouldShowAddFlip={!validationRunning}
          />
        </Box>
        <FlipList flips={filteredFlips} onUpdateFlips={setFilteredFlips} />
      </Box>
    </Layout>
  )
}

export default Flips
