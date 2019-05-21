import React, {useContext, useState, useEffect} from 'react'
import nanoid from 'nanoid'
import {Heading, Box} from '../../shared/components'
import CreateFlipMaster from '../../screens/flips/screens/create-flip/components/create-flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'
import {NotificationContext} from '../../shared/providers/notification-provider'

function NewFlip() {
  const {onAddNotification} = useContext(NotificationContext)

  const [id, setId] = useState()

  useEffect(() => {
    setId(nanoid())
  }, [])

  return (
    <Layout>
      <Box p={theme.spacings.large}>
        <Heading>New flip</Heading>
        {id && (
          <CreateFlipMaster id={id} onAddNotification={onAddNotification} />
        )}
      </Box>
    </Layout>
  )
}

export default NewFlip
