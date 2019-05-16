import React, {useContext} from 'react'
import {SubHeading, Link} from '../../../shared/components'
import FlipGroup from './flip-group'
import FlipContext from '../../flips/providers/flip-provider'
import theme from '../../../shared/theme'

export default function() {
  const {drafts, published} = useContext(FlipContext)
  return (
    <>
      <SubHeading>
        My FLIPs&nbsp;
        <Link href="/submit-flip" color={theme.colors.primary}>
          Add
        </Link>
      </SubHeading>
      <FlipGroup name="Drafts" flips={drafts} />
      <FlipGroup name="Published" flips={published} />
    </>
  )
}
