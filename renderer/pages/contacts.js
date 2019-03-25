import React, {useContext} from 'react'
import {Layout} from '../components/layout'
import {
  ContactNav,
  ContactList,
  Actions,
  ContactSearch,
  ContactDetails,
} from '../components/contacts'
import {ContactContext} from '../providers'
import {Row, Col} from '../components/atoms'

export default () => {
  const contacts = useContext(ContactContext)
  return (
    <Layout>
      <Row>
        <Col w={4}>
          <ContactNav>
            <ContactSearch />
            <Actions />
            <ContactList contacts={contacts} />
          </ContactNav>
        </Col>
        <Col w={8}>
          <ContactDetails {...contacts[0]} />
        </Col>
      </Row>
    </Layout>
  )
}
