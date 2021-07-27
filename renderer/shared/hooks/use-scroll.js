export function useScroll(ref) {
  return {
    scrollTo: () => ref.current.scrollIntoView(),
  }
}
