export function formatKeywords(keywords) {
  return keywords
    .map(({name: [f, ...rest]}) => f.toUpperCase() + rest.join(''))
    .join(' / ')
}
