import {theme as defaultTheme} from '@chakra-ui/react'

const breakpoints = {
  sm: '30em',
  md: '40em',
  lg: '52em',
  xl: '64em',
}

export const theme = {
  colors: {
    black: '#16161D',
    blue: {
      '010': 'rgb(87 143 255 / 0.1)',
      '012': 'rgb(87 143 255 / 0.12)',
      '020': 'rgb(87 143 255 / 0.2)',
      '025': 'rgb(87 143 255 / 0.25)',
      '030': 'rgb(87 143 255 / 0.3)',
      '032': 'rgb(87 143 255 / 0.32)',
      '090': 'rgb(87 143 255 / 0.9)',
      200: '#578fff',
      300: 'rgba(87, 143, 255, .12)',
      500: 'rgb(87, 143, 255)',
      600: 'rgb(87, 143, 255)',
    },
    gray: {
      '016': 'rgb(83 86 92 /0.16)',
      '030': 'rgb(83 86 92 /0.30)',
      '064': 'rgb(83 86 92 /0.64)',
      '080': 'rgb(83 86 92 /0.80)',
      10: 'rgba(255,255,255,0.1)',
      50: 'rgb(245 246 247)',
      100: 'rgb(210, 212, 217)',
      200: 'rgb(210 212 217)',
      212: 'rgb(210 212 217 /0.12)',
      300: 'rgb(232, 234, 237)',
      500: 'rgb(83 86 92)',
      600: 'rgb(83 86 92)',
      800: 'rgb(83 86 92)',
      900: 'rgb(17 17 17)',
      980: 'rgba(17 17 17 /0.80)',
    },
    red: {
      '010': 'rgb(255 102 102 /0.10)',
      '012': 'rgb(255 102 102 /0.12)',
      '016': 'rgb(255 102 102 /0.16)',
      '020': 'rgb(255 102 102 /0.20)',
      '025': 'rgb(255 102 102 /0.25)',
      '050': 'rgb(255 102 102 /0.50)',
      '090': 'rgb(255 102 102 /0.90)',
      500: 'rgb(255, 102, 102)',
    },
    green: {
      '010': 'rgb(39 217 128 /.1)',
      '020': 'rgb(39 217 128 /.2)',
      '040': 'rgb(39 217 128 /.4)',
      '050': 'rgb(39 217 128 /.5)',
      500: 'rgb(39 217 128)',
    },
    orange: {
      '010': 'rgb(255 163 102 /0.1)',
      '020': 'rgb(255 163 102 /0.2)',
      '040': 'rgb(255 163 102 /0.5)',
      '050': 'rgb(255 163 102 /0.5)',
      500: 'rgb(255, 163, 102)',
    },
    warning: {
      '016': 'rgba(255, 163, 102, 0.16)',
      100: 'rgba(255, 163, 102, 0.2)',
      400: 'rgb(255, 163, 102)',
      500: 'rgb(255, 163, 102)',
    },
    success: {
      '016': 'rgba(39, 217, 128, 0.16)',
      100: 'rgba(39, 217, 128, 0.2)',
      400: 'rgb(39, 217, 128)',
    },
    muted: 'rgb(150, 153, 158)',
    brand: {
      gray: 'rgb(83, 86, 92)',
      blue: 'rgb(87, 143, 255)',
    },
    brandGray: {
      '005': 'rgb(83 86 92 /0.05)',
      '006': 'rgb(83 86 92 /0.06)',
      '016': 'rgb(83, 86, 92, 0.16)',
      '060': 'rgb(83 86 92 /0.6)',
      '080': 'rgb(83 86 92 /0.8)',
      500: 'rgb(83, 86, 92)',
    },
    brandBlue: {
      10: 'rgba(87, 143, 255, 0.12)',
      20: 'rgba(87, 143, 255, 0.24)',
      '025': 'rgba(87, 143, 255, 0.25)',
      50: 'rgba(87, 143, 255, 0.24)',
      100: '#578fff',
      200: '#578fff',
      300: '#447ceb',
      400: '#447ceb',
      500: 'rgb(87, 143, 255)',
      600: '#447ceb',
      700: '#447ceb',
    },
    xblack: {
      '016': 'rgb(0 0 0 /0.16)',
      '080': 'rgb(0 0 0 /0.8)',
    },
    xwhite: {
      '010': 'rgb(255 255 255 /0.10)',
      '016': 'rgb(255 255 255 /0.16)',
      '040': 'rgb(255 255 255 /0.4)',
      '050': 'rgba(255, 255, 255, 0.5)',
      '090': 'rgba(255, 255, 255, 0.9)',
    },
    graphite: {
      500: 'rgb(69 72 77)',
    },
  },
  fonts: {
    body: ['Inter', defaultTheme.fonts.body].join(', '),
    heading: ['Inter', defaultTheme.fonts.heading].join(', '),
  },
  fontSizes: {
    sm: '11px',
    md: '13px',
    mdx: '14px',
    base: '16px',
    lg: '18px',
    xl: '28px',
  },
  breakpoints,
  space: {
    '1/2': '2px',
    '3/2': '6px',
  },
  sizes: {
    sm: rem(360),
    mdx: '400px',
    md: rem(480),
  },
  radii: {
    sm: '0.25rem',
    md: rem(6),
    xl: '0.75rem',
  },
  components: {
    Modal: {
      baseStyle: {
        overlay: {
          bg: 'xblack.080',
        },
      },
      sizes: {
        mdx: {
          dialog: {
            maxW: '400px',
          },
        },
        440: {
          dialog: {
            maxW: '440px',
          },
        },
        md: {
          dialog: {
            maxW: '480px',
          },
        },
        '416': {
          dialog: {
            maxW: '416px',
          },
        },
        '664': {
          dialog: {
            maxW: '664px',
          },
        },
        xl: {
          dialog: {
            maxW: '30%',
          },
        },
      },
    },
    Drawer: {
      baseStyle: {
        overlay: {
          bg: 'xblack.080',
        },
        footer: {
          borderTopWidth: 1,
          borderTopColor: 'gray.300',
          py: 3,
          paddingX: 4,
          justify: 'flex-end',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
    },
    Menu: {
      baseStyle: {
        button: {
          borderRadius: 'md',
          h: 8,
          w: 6,
          _hover: {bg: 'gray.50'},
          _expanded: {bg: 'gray.50'},
        },
        list: {
          border: 'none',
          borderRadius: 'lg',
          py: 2,
          minW: '145px',
          shadow:
            '0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)',
          '&:focus:not([data-focus-visible-added])': {
            shadow:
              '0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)',
          },
        },
        item: {
          fontWeight: 500,
          px: 3,
          py: '1.5',
          _hover: {bg: 'gray.50'},
          _focus: {bg: 'gray.50'},
        },
        divider: {
          borderColor: 'gray.300',
          borderWidth: 1,
          my: '2',
        },
      },
    },
    Radio: {
      sizes: {
        lg: {
          h: '14',
        },
      },
      variants: {
        bordered: {
          container: {
            borderColor: 'gray.300',
            borderWidth: 1,
            borderRadius: 'md',
            px: '3',
            py: '2',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: 500,
      },
      sizes: {
        md: {
          h: '8',
        },
        mdx: {
          h: '10',
        },
        lg: {
          h: '12',
          px: '3',
          borderRadius: 'lg',
          fontSize: '15px',
          fontWeight: 400,
        },
        lgx: {
          h: '14',
          px: '3',
          borderRadius: '14px',
          fontSize: '20px',
          fontWeight: 500,
        },
      },
      variants: {
        primary: {
          bg: 'blue.500',
          color: 'white',
          borderRadius: 6,
          px: 4,
          _hover: {
            bg: 'rgb(68, 124, 235)',
            _disabled: {
              bg: 'blue.500',
            },
          },
          _active: {
            bg: 'rgb(68, 124, 235)',
          },
        },
        secondary: {
          bg: 'blue.012',
          color: 'blue.500',
          borderRadius: 6,
          px: 4,
          _hover: {
            bg: 'blue.024',
            _disabled: {
              bg: 'gray.100',
            },
          },
          _active: {
            bg: 'blue.024',
          },
          _disabled: {
            bg: 'gray.100',
            color: 'gray.300',
          },
        },
        danger: {
          bg: 'red.500',
          _hover: {
            bg: 'red.500',
            _disabled: {
              bg: 'red.500',
            },
          },
          _active: {
            bg: 'red.500',
          },
        },
        primaryFlat: {
          bg: 'transparent',
          color: 'brandBlue.500',
          borderRadius: 8,
        },
        secondaryFlat: {
          bg: 'transparent',
          color: 'muted',
          borderRadius: '8',
          _disabled: {
            color: 'gray.300',
          },
        },
        tab: {
          color: 'muted',
          borderRadius: '6',
          h: '8',
          px: '4',
          _hover: {
            bg: 'gray.50',
            color: 'blue.500',
          },
          _selected: {
            bg: 'gray.50',
            color: 'blue.500',
          },
          _active: {
            bg: 'gray.50',
            color: 'blue.500',
          },
        },
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            h: 8,
            px: 3,
            borderRadius: 'md',
            fontSize: 'md',
          },
        },
        lg: {
          field: {
            h: 12,
            px: 3,
            borderRadius: 'lg',
            fontSize: '15px',
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'gray.300',
            },
            _placeholder: {
              color: 'muted',
            },
            _disabled: {
              bg: 'gray.50',
              color: 'muted',
              '-webkit-text-fill-color': '#96999E',
              opacity: 1,
            },
            _readOnly: {
              bg: 'gray.50',
              color: 'muted',
              '-webkit-text-fill-color': '#96999E',
            },
          },
        },
      },
    },
    NumberInput: {
      sizes: {
        md: {
          field: {
            h: 8,
            px: 3,
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'gray.300',
            },
            _placeholder: {
              color: 'muted',
            },
            _disabled: {
              bg: 'gray.50',
              color: 'muted',
              '-webkit-text-fill-color': '#96999E',
              opacity: 1,
            },
          },
        },
      },
    },
    Textarea: {
      sizes: {
        md: {
          px: 3,
          py: 2,
          minH: '16',
        },
      },
      variants: {
        outline: {
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'gray.300',
          },
          _placeholder: {
            color: 'muted',
          },
        },
      },
    },
    Select: {
      sizes: {
        md: {
          field: {
            px: '2',
          },
        },
      },
    },
    FormError: {
      baseStyle: {
        text: {
          fontSize: 'md',
          lineHeight: '4',
        },
        icon: {
          boxSize: '3',
          marginEnd: '1',
        },
      },
    },
    Table: {
      baseStyle: {
        table: {
          fontVariantNumeric: 'normal',
          width: '100%',
        },
      },
      sizes: {
        md: {
          td: {
            px: 3,
            py: 2,
            lineHeight: 'inherit',
          },
        },
      },
    },
    Alert: {
      variants: {
        validation: ({colorScheme}) => ({
          container: {
            bg: `${colorScheme}.500`,
            color: 'white',
            borderRadius: 'lg',
            boxShadow:
              '0 3px 12px 0 rgba(255, 102, 102, 0.1), 0 2px 3px 0 rgba(255, 102, 102, 0.2)',
            px: '4',
            py: '1',
            minH: '42px',
          },
          title: {
            fontSize: 'md',
            fontWeight: 400,
            lineHeight: '5',
            marginEnd: ['2', '6'],
            maxW: ['48', 'none'],
          },
          description: {
            lineHeight: '5',
          },
          icon: {
            flexShrink: 0,
            marginEnd: '3',
            w: '5',
            h: '5',
          },
          spinner: {
            flexShrink: 0,
            marginEnd: '3',
            w: '5',
            h: '5',
          },
        }),
      },
    },
    Form: {
      baseStyle: {
        container: {
          px: 'px',
          pb: 'px',
        },
      },
    },
  },
}

export function rem(value) {
  return `${value / 16}rem`
}
