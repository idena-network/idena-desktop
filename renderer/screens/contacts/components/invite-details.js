import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {
  wordWrap,
  margin,
  rem,
  padding,
  borderRadius,
  backgrounds,
} from 'polished'
import {Box, Drawer, SubHeading, Text, Field, Hint} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import useFullName from '../../../shared/hooks/use-full-name'
import {useInviteState} from '../../../shared/providers/invite-context'
import ContactInfo from '../../contacts/components/contact-info'
import ContactToolbar from './contact-toolbar'
import {Figure} from '../../../shared/components/utils'
import {fetchIdentity} from '../../../shared/api'
import RenameInvite from './invite-form'

import {useInviteDispatch} from '../../../shared/providers/invite-context'



function InviteDetails({
  dbkey, 
  hash,
  receiver,
  amount,
  mining,
  activated,
  canKill,
  firstName,
  lastName,
  code,
}) {
  const [identity, setIdentity] = useState(null) 
  const [showRenameForm, setShowRenameForm] = useState(false) 
  const {updateInvite} = useInviteDispatch()

  const [newFirstName, setNewFirstName] = React.useState(firstName)
  const [newLastName, setNewLastName] = React.useState(lastName)

  const isMining = mining
  const isActivated = activated



  React.useEffect(() => {
    let ignore = false
    async function fetchData() {
      if (!ignore) {
        setIdentity(await fetchIdentity(receiver))
      }
    }
    fetchData()
    return () => {
      ignore = true
    }
  }, [])

                
  const address = receiver
  const invite = {address, receiver, firstName: newFirstName, lastName: newLastName, mining:isMining, activated:isActivated}
  const inviteIsExpired = identity && (identity.state=='Undefined') && (!canKill) && (!isMining) && (!isActivated);

  //if (inviteIsExpired)
  //  alert('isMining='+isMining + ' inviteIsExpired='+inviteIsExpired + ' isActivated='+isActivated + ' identity.state='+ (identity && identity.state) + ' canKill='+canKill) 


  const state = (inviteIsExpired ? 'Expired invitation' :
                   (identity&&identity.state=='Invite'? 'Invitation' : 
                    mining?'Mining...':identity&&identity.state 
                   ) 
                )

  return (
    <div style={{width: rem('700px') }}>

      <section>

        <ContactInfo {...invite} showMining={isMining}  />

        <ContactToolbar 
          onRename={() => {setShowRenameForm(true)}} 
          onKill={ canKill?()=>{ /*TODO*/  }:null }
        />

        <div>
          <Figure label="Status" value={state} />
          { identity && (identity.state!='Invite') && !inviteIsExpired && !mining && (
            <Figure label="Address" value={receiver} />
          )} 

          { !inviteIsExpired && (  
            <WideField
              label="Invitation code"
              defaultValue={code}
              disabled={true}
              allowCopy={!isActivated}
            />
          )}  

        </div>
      </section>

      <Drawer
        show={showRenameForm}
        onHide={() => {
          setShowRenameForm(false)
        }}
      >
        <RenameInvite
          {...invite} 
          onSave = { 
                    async (firstName, lastName) => {
                    setShowRenameForm(false)
                    setNewFirstName(firstName)
                    setNewLastName(lastName)
                    const id=dbkey
                    await updateInvite( id, firstName, lastName )   
          }}
        />
      </Drawer>

      <style jsx>{`
        div {
          padding: 3em;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        section > div {
          background: ${theme.colors.gray};
          border-radius: 4px;
          padding: ${theme.spacings.xlarge};
        }
        div > section:nth-child(2) {
          display: flex;
          align-items: flex-end;
          flex: 1;
        }
      `}</style>
    </div>
  )

/*
  return (
    <Box
      css={padding(rem(theme.spacings.medium32), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={receiver} size={80} />
      </Box>
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, 0),
          textAlign: 'center',
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          Invite for {fullName || receiver}
        </SubHeading>
        <Status mined={mined}>{mined ? 'Mined.' : 'Mining...'}</Status>
      </Box>
      <Flex justify="space-between">
        <NameField label="First name" defaultValue={firstName} />
        <NameField label="Last name" defaultValue={lastName} />
      </Flex>
      <WideField label="Amount" defaultValue={amount} disabled={readonly}>
        <Hint label="Fee" value="0.999 DNA" />
        <Hint label="Total amount" value="1000.999 DNA" />
      </WideField>
      <WideField
        label="Invitation code"
        defaultValue={code}
        disabled={readonly}
        allowCopy
      />
      <WideField
        label="Transaction ID"
        defaultValue={hash}
        disabled={readonly}
        allowCopy
      />
      <WideField
        label="Receiver"
        defaultValue={receiver}
        disabled={readonly}
        allowCopy
      />
    </Box>
  )
*/

}

InviteDetails.propTypes = {
  dbkey: PropTypes.string,
  hash: PropTypes.string,
  receiver: PropTypes.string,
  amount: PropTypes.number,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  mining: PropTypes.bool,
  activated: PropTypes.bool,
  code: PropTypes.string,
}


const NameField = props => <Field {...props} style={{width: rem(140)}} />
const WideField = props => <Field {...props} style={{width: "100%"}} />

export default InviteDetails
