import {rem as remp, rgb} from 'polished'
import {margin} from './components/system/spacings'

const colors = {
  primary: 'rgb(87, 143, 255)',
  primary2: 'rgb(83, 86, 92)',
  text: 'rgb(83, 86, 92)',
  muted: 'rgb(150, 153, 158)',
  gray: 'rgb(245, 246, 247)',
  gray2: 'rgb(232, 234, 237)',
  gray3: 'rgba(83, 86, 92, 0.3)',
  gray4: 'rgb(210, 212, 217)',
  gray5: rgb(64, 64, 64),
  white: 'rgb(255, 255, 255)',
  white05: 'rgba(255, 255, 255, 0.5)',
  white01: 'rgba(255, 255, 255, 0.1)',
  danger: 'rgb(255, 102, 102)',
  danger02: 'rgba(255, 102, 102, 0.2)',
  warning: 'rgb(255, 163, 102)',
  warning02: 'rgba(255, 163, 102, 0.2)',
  warning04: 'rgba(255, 163, 102, 0.4)',
  success: 'rgb(39, 217, 128)',
  success02: 'rgba(39, 217, 128, 0.2)',
  success04: 'rgb(39, 217, 128, 0.4)',
  black: 'rgb(17,17,17)',
  black0: 'rgb(0,0,0)',
}

const fontSizes = {
  base: 13,
  heading: '2rem',
  subHeading: '1.4em',
  blockHeading: '1rem',
  normal: '1rem',
  small: '0.72rem',
  large: '1.4em',
}

const fontWeights = {
  normal: 400,
  medium: 500,
  semi: 600,
  bold: 700,
}

const spacings = {
  xxsmall: '0.1em',
  small: '0.5em',
  small8: 8,
  small12: 12,
  normal: '1em',
  medium16: 16,
  medium24: 24, // TODO: rename it more meaningful from design system perspective
  medium32: 32,
  large: 80,
  large48: 48,
  xlarge: '2em',
  xxlarge: '3em',
  xxxlarge: '4em',
}

export default {
  colors,
  spacings,
  fontSizes,
  fontWeights,
  Box: {
    w: '',
    bg: '',
  },
  Flex: {
    direction: 'initial',
    justify: 'initial',
    align: 'initial',
  },
  Heading: {
    color: colors.text,
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semi,
    ...margin(0),
  },
  SubHeading: {
    color: colors.text,
    fontSize: fontSizes.subHeading,
    fontWeight: fontWeights.semi,
    ...margin(0),
  },
  BlockHeading: {
    color: colors.text,
    fontSize: fontSizes.blockHeading,
    fontWeight: fontWeights.medium,
    ...margin(0),
  },
  Text: {
    color: colors.text,
    fontSize: fontSizes.normal,
    fontWeight: fontWeights.normal,
  },
  Link: {
    color: colors.text,
    fontSize: fontSizes.normal,
    fontWeight: fontWeights.normal,
    textDecoration: 'none',
  },
  Button: {
    color: colors.text,
    size: fontSizes.base,
  },
}

export function rem(value) {
  return remp(value, fontSizes.base)
}
