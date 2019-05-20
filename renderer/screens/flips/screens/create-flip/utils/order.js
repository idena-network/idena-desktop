/* eslint-disable import/prefer-default-export */

export function randomFlipOrder(flips, randomOrder) {
  return Math.random() < 0.5
    ? [flips.map((_, idx) => idx), randomOrder]
    : [randomOrder, flips.map((_, idx) => idx)]
}
