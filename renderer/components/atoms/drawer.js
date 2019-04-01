import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Absolute, Fill} from './utils'
import theme from '../../theme'
import {Text} from './typo'

export function Drawer({show, ...props}) {
  const [showDrawer, setDrawerVisibility] = useState(false)
  useEffect(() => {
    setDrawerVisibility(show)
  }, [show])
  return showDrawer ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <Absolute
        bg={theme.colors.white}
        zIndex={2}
        top={0}
        bottom={0}
        right={0}
        w="350px"
        {...props}
      />
      <Absolute top="1em" right="1em" zIndex={2}>
        <Text
          color={theme.colors.muted}
          size="1.6em"
          css={{cursor: 'pointer'}}
          onClick={() => setDrawerVisibility(false)}
        >
          &times;
        </Text>
      </Absolute>
    </Fill>
  ) : null
}

Drawer.propTypes = {
  show: PropTypes.bool,
}

export default Drawer
