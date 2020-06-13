export function callRpc(url = 'http://localhost:9009') {
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
          key: '7129ba6d0b162a4c5fa5a020aff9cac5',
        }),
      })
    ).json()
    if (error) throw new Error(error.message)
    return result
  }
}
