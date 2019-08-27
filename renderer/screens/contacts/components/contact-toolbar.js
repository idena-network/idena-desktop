import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, margin} from 'polished'
import {FiSend, FiDollarSign, FiSlash} from 'react-icons/fi'
import theme from '../../../shared/theme'
import {IconButton} from '../../../shared/components/button'
import Divider from '../../../shared/components/divider'
import Flex from '../../../shared/components/flex'

function ContactToolbar({onRename, onRevokeInvitation, onSendCoins}) {

  return(
    <Flex
      css={{
        ...padding(rem(theme.spacings.small8), 0),
        ...margin(rem(theme.spacings.medium16), 0),
      }}
    >


      <IconButton disabled={true} icon={<FiSend />} color={theme.colors.primary}>
        Send message
      </IconButton>
      <Divider vertical />

        <IconButton disabled={true} icon={<FiDollarSign />} color={theme.colors.primary}
          onClick={() => {
            onSendCoins && onSendCoins()
          }}
        >
          Send coins
        </IconButton>
        <Divider vertical/>

  
        <Divider vertical/>
        <IconButton disabled={true} icon={<FiSlash />} color={theme.colors.primary}
          onClick={() => {
            onRevokeInvitation && onRevokeInvitation()
          }}
        >
          Revoke invitation
        </IconButton>
        <Divider vertical/>


        <IconButton color={theme.colors.primary}
          onClick={() => {
            onRename && onRename()
          }} 
        >
          Rename
        </IconButton> 


    </Flex>
  )
}

ContactToolbar.propTypes = {
  onRename: PropTypes.func,
  onRevokeInvitation: PropTypes.func,
  onSendCoins: PropTypes.func,
}


export default ContactToolbar