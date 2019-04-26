import React from 'react'
import Layout from './shared/contact-layout'
import {SubHeading} from '../../shared/components'
import {ContactProvider} from './providers/contact-provider'

export default function() {
  return (
    <ContactProvider>
      <Layout>
        <SubHeading>Select contact to the left</SubHeading>
      </Layout>
    </ContactProvider>
  )
}
