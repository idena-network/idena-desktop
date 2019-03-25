import React from 'react'
import {FlipEditor} from '../components/flips'
import {Layout} from '../components/layout'

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
