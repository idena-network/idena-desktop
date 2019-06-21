/* eslint-disable import/prefer-default-export */
import words from './words'

const randomIndex = currentIndex => Math.floor(Math.random() * currentIndex)

export function getRandomHint() {
  const nextIndex = randomIndex(words.length)

  const firstWord = words[nextIndex]
  const secondWord = words[randomIndex(nextIndex)]

  // while (secondWord === firstWord) {
  //   secondWord = words[randomIndex(nextIndex)]
  // }

  return [firstWord, secondWord].map(({name, desc}) => ({
    name,
    desc: desc || name,
  }))
}
