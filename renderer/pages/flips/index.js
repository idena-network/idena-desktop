import React from 'react'
import Layout from '../../components/layout'
import {FlipEditor} from './components/flip-editor'

export default () => (
  <Layout>
    <div>
      <FlipEditor />
    </div>
    <style jsx>{`
      div {
        padding: 1em;
      }
    `}</style>
  </Layout>
)
