import css from 'styled-jsx/css'

/* eslint-disable import/prefer-default-export */
export function transformToMarginStyleObj({
  mt: marginTop,
  mr: marginRight,
  mb: marginBottom,
  ml: marginLeft,
}) {
  return css`
    ${marginTop && `margin-top: ${marginTop}`};
    ${marginRight && `margin-right: ${marginRight}`};
    ${marginBottom && `margin-bottom: ${marginBottom}`};
    ${marginLeft && `margin-left: ${marginLeft}`};
  `
}
