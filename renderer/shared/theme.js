/** @type import('@chakra-ui/react').ChakraTheme */
export const theme = {
  styles: {
    global: {
      body: {
        fontFamily: 'body',
        fontSize: 'md',
        color: 'gray.500',
        lineHeight: 'base',
      },
    },
  },
  colors: {
    black: '#16161D',
    blue: {
      '010': 'rgb(87 143 255 / 0.1)',
      '012': 'rgb(87 143 255 / 0.12)',
      '016': 'rgb(87 143 255 / 0.16)',
      '020': 'rgb(87 143 255 / 0.2)',
      '025': 'rgb(87 143 255 / 0.25)',
      '030': 'rgb(87 143 255 / 0.3)',
      '032': 'rgb(87 143 255 / 0.32)',
      '090': 'rgb(87 143 255 / 0.9)',
      200: '#578fff',
      300: 'rgb(87 143 255 /.12)',
      500: 'rgb(87 143 255)',
    },
    gray: {
      '005': 'rgb(83 86 92 /0.05)',
      '006': 'rgb(83 86 92 /0.06)',
      '016': 'rgb(83 86 92 /0.16)',
      '060': 'rgb(83 86 92 /0.6)',
      '080': 'rgb(83 86 92 /0.8)',
      50: 'rgb(245, 246, 247)',
      100: 'rgb(210 212 217)',
      200: '#53565c',
      300: 'rgb(232 234 237)',
      400: 'rgb(232 234 237)',
      500: 'rgb(83 86 92)',
    },
    red: {
      '010': 'rgb(255 102 102 /0.10)',
      '012': 'rgb(255 102 102 /0.12)',
      '020': 'rgb(255 102 102 /0.20)',
      '024': 'rgb(255 102 102 /0.24)',
      '050': 'rgb(255 102 102 /0.50)',
      '090': 'rgb(255 102 102 / 0.9)',
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
    body: ['Inter'].join(', '),
    heading: ['Inter'].join(', '),
  },
  fontSizes: {
    sm: '11px',
    md: '13px',
    mdx: '14px',
    base: '1rem',
    lg: '18px',
    xl: '28px',
  },
  lineHeights: {
    '4.5': '1.125rem',
  },
  space: {
    '4.5': '1.125rem',
  },
  sizes: {
    '4.5': '1.125rem',
    sm: rem(360),
    md: rem(480),
  },
  radii: {
    sm: '0.25rem',
    md: rem(6),
    xl: '0.75rem',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 500,
      },
      variants: {
        link: {
          lineHeight: '4',
          alignItems: 'baseline',
          _active: {
            color: 'blue.500',
          },
        },
        ghost: {
          color: 'blue.500',
          justifyContent: 'start',
          h: '8',
          px: '2',
        },
        danger: {
          bg: 'red.500',
          _hover: {
            bg: 'rgb(227 60 60)',
          },
          _active: {
            bg: 'rgb(227 60 60)',
          },
          _focus: {
            boxShadow: '0 0 0 3px rgb(255 102 102 /0.50)',
          },
        },
      },
    },
    IconButton: {
      variants: {
        menu: {
          borderRadius: 'md',
          color: 'muted',
          _hover: {
            bg: 'gray.100',
          },
          _expanded: {
            bg: 'gray.100',
          },
        },
      },
      sizes: {
        menu: {
          h: '5',
          w: '3',
          minW: '3',
        },
      },
    },
    Radio: {
      baseStyle: {
        control: {
          borderColor: 'gray.100',
        },
      },
      variants: {
        bordered: {
          container: {
            borderColor: 'gray.100',
            borderWidth: 1,
            borderRadius: 'md',
          },
        },
        dark: {
          container: {
            borderColor: 'white',
            _checked: {
              bg: 'gray.500',
            },
            _disabled: {
              bg: 'none',
              borderColor: 'gray.300',
            },
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        mb: 0,
        mr: 0,
        h: '4.5',
        lineHeight: '4.5',
      },
    },
    Input: {
      sizes: {
        md: {
          field: {
            h: '8',
            px: '3',
            borderRadius: 'md',
            fontSize: 'md',
          },
          addon: {
            h: '8',
            w: '8',
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.100',
            _hover: {
              borderColor: 'gray.100',
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
    Modal: {
      baseStyle: {
        overlay: {
          bg: 'xblack.080',
        },
      },
      sizes: {
        sm: {
          dialog: {
            maxW: 360,
          },
        },
        mdx: {
          dialog: {
            maxW: '400px',
          },
        },
        md: {
          dialog: {
            maxW: '480px',
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        item: {
          fontWeight: 500,
          py: '2',
          px: '3',
          _focus: {
            bg: 'gray.50',
          },
          _active: {
            bG: 'gray.50',
          },
          _expanded: {
            bg: 'gray.50',
          },
          _disabled: {
            opacity: 0.4,
            cursor: 'not-allowed',
          },
        },
      },
    },
  },
}

export function rem(value) {
  return `${value / 16}rem`
}
