import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {Heading, Box} from '../../shared/components'
import CreateFlipMaster from '../../screens/flips/screens/create-flip/components/flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'
import {NotificationContext} from '../../shared/providers/notification-provider'

const defaultRouter = {query: {id: ''}}

function EditFlip({router: {query: {id}} = defaultRouter}) {
  const {getDraft} = global.flips

  const {onAddNotification} = useContext(NotificationContext)
  const draft = getDraft(id)

  return id ? (
    <Layout>
      <Box p={theme.spacings.large}>
        <Heading>Edit flip</Heading>
        <CreateFlipMaster
          id={id}
          {...draft}
          onAddNotification={onAddNotification}
        />
      </Box>
    </Layout>
  ) : null
}

EditFlip.propTypes = {
  router: PropTypes.object.isRequired,
}

export default withRouter(EditFlip)
