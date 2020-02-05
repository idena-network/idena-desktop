export const addWheelHandler = setZoomLevel => {
  const handleWheel = e => {
    if (e.ctrlKey) {
      e.preventDefault()
      setZoomLevel(level => Math.min(Math.max(-5, level + e.deltaY * -0.01), 5))
    }
  }
  document.addEventListener('wheel', handleWheel)
  return () => {
    document.removeEventListener('wheel', handleWheel)
  }
}
