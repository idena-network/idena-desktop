export const arrToFormData = arr => {
  const formData = new FormData()

  for (var i = 0; i < arr.length; i++) {
    formData.append('flips', arr[i])
  }
  return formData
}
