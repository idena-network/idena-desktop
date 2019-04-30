/* eslint-disable import/prefer-default-export */

export const ensurePath = useMock => path =>
  `.${useMock ? '/__mocks__' : ''}/${path}`
