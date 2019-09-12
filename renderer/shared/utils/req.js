export const arrToFormData = arr => {
  const formData = new FormData()

  for (let i = 0; i < arr.length; i += 1) {
    formData.append('flips', arr[i])
  }
  return formData
}

export const toHex = data => `0x${data.toString('hex')}`
