export function callRpc(url = 'http://localhost:9009', key) {
  return async function(method, ...params) {
    const {result, error} = await (
      await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
          id: 1,
          key,
        }),
      })
    ).json()
    if (error) throw new Error(error.message)
    return result
  }
}

export function toPercent(value) {
  return value.toLocaleString(undefined, {
    style: 'percent',
    maximumSignificantDigits: 4,
  })
}

export const toLocaleDna = locale => {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 16,
  })
  return value => `${formatter.format(value)} DNA`
}
