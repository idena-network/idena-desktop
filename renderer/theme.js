import {margin} from './shared/components/system/spacings'

const colors = {
  primary: 'rgb(87, 143, 255)',
  primary2: 'rgb(83, 86, 92)',
  text: 'rgb (83, 86, 92)',
  muted: 'rgb(150, 153, 158)',
  gray: 'rgb(245, 246, 247)',
  gray2: 'rgb(232, 234, 237)',
  gray3: 'rgba(83, 86, 92, 0.3)',
  white: 'rgb(255, 255, 255)',
}

const fontSizes = {
  heading: '1.7rem',
  subHeading: '1.2rem',
  normal: '1rem',
  small: '0.72rem',
}

const fontWeights = {
  normal: 400,
  semi: 600,
  bold: 700,
}

const spacings = {
  small: '0.5em',
  normal: '1em',
  large: '1.5em',
  xlarge: '2em',
}

export default {
  colors,
  spacings,
  fontSizes,
  fontWeights,
  Heading: {
    color: colors.text,
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semi,
    ...margin([0, 0, spacings.normal]),
  },
  SubHeading: {
    color: colors.text,
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semi,
    ...margin(0),
  },
  Text: {
    color: colors.text,
    fontSize: fontSizes.normal,
    fontWeight: fontWeights.normal,
  },
}
