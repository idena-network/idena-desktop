import React from 'react'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentity} from '../../shared/providers/identity-context'
import {apiMethod} from '../../shared/utils/utils'

function useValidationScore() {
  const [{totalShortFlipPoints, totalQualifiedFlips}] = useIdentity()
  return Math.min(totalShortFlipPoints / totalQualifiedFlips, 1)
}

export function useValidationReportSummary() {
  const [{address, availableFlips}] = useIdentity()

  const epoch = useEpochState()

  const score = useValidationScore()

  const [earnings, setEarnings] = React.useState()

  React.useEffect(() => {
    if (epoch?.epoch && address) {
      fetch(
        apiMethod(
          `epoch/${71 ||
            epoch?.epoch}/identity/${'0x8b8C0607c9AE92B567ADef452e79DC673C3c180D' ||
            address}/rewards`
        )
      )
        .then(r => r.json())
        .then(({result}) =>
          result.reduce(
            (acc, curr) => acc + Number(curr.balance) + Number(curr.stake),
            0
          )
        )
        .then(setEarnings)
    }
  }, [address, epoch])

  const [missedRewards, setMissedRewards] = React.useState()

  React.useEffect(() => {
    async function fetchData() {
      const {result: rewardsSummary} = await (
        await fetch(apiMethod(`epoch/${71 || epoch?.epoch}/rewardsSummary`))
      ).json()

      const {result: rewards} = await (
        await fetch(
          apiMethod(
            `epoch/${71 ||
              epoch?.epoch}/identity/${'0x8b8C0607c9AE92B567ADef452e79DC673C3c180D' ||
              address}/rewards`
          )
        )
      ).json()

      const flipRewards = rewards.find(r => r.type === 'Flips')

      const missedFlipRewards =
        rewardsSummary.flipsShare * (5 || availableFlips) -
        (Number(flipRewards.balance) + Number(flipRewards.stake))

      setMissedRewards(missedFlipRewards)
    }
    if (epoch?.epoch && address) fetchData()
  }, [address, availableFlips, epoch])

  return {score, earnings, earningsScore: earnings / (earnings + missedRewards)}
}
