import {margin} from './components/system/spacings'

const colors = {
  primary: 'rgb(87, 143, 255)',
  primary2: 'rgb(83, 86, 92)',
  text: 'rgb(83, 86, 92)',
  muted: 'rgb(150, 153, 158)',
  gray: 'rgb(245, 246, 247)',
  gray2: 'rgb(232, 234, 237)',
  gray3: 'rgba(83, 86, 92, 0.3)',
  white: 'rgb(255, 255, 255)',
  white05: 'rgba(255, 255, 255, 0.5)',
  white01: 'rgba(255, 255, 255, 0.1)',
  danger: 'rgba(255, 102, 102, 0.8)',
  success: '#00b894',
}

const fontSizes = {
  heading: '2rem',
  subHeading: '1.4em',
  normal: '1rem',
  small: '0.72rem',
  large: '1.4em',
}

const fontWeights = {
  normal: 400,
  semi: 600,
  bold: 700,
}

const spacings = {
  xxsmall: '0.1em',
  small: '0.5em',
  normal: '1em',
  large: '1.5em',
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
    bg: 'inherit',
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
    ...margin([0, 0, spacings.normal]),
  },
  SubHeading: {
    color: colors.text,
    fontSize: fontSizes.subHeading,
    fontWeight: fontWeights.semi,
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
}
