import {Box, createIcon, Stack, Text, useTheme} from '@chakra-ui/react'
import React, {useMemo} from 'react'
import {Tooltip} from '../../shared/components/components'
import {useIdentity} from '../../shared/providers/identity-context'
import {IdentityStatus} from '../../shared/types'
import {toPercent} from '../../shared/utils/utils'

const calculateStakeLoss = age => Math.max(age === 4 ? 1 : (10 - age) / 100, 0)

/**
 * @typedef { "miss" | "fail" } Reason
 */

/**
 * @typedef {"highRisk" | "moderateRisk" | "safe"} ProtectionLevel
 */

/**
 * @param {{type: Reason}}
 * @returns {ProtectionLevel}
 * */
function useProtectionLevel({type}) {
  const [{state, age}] = useIdentity()

  return useMemo(() => {
    const isSafe =
      state === IdentityStatus.Human ||
      (type === 'miss' &&
        [IdentityStatus.Verified, IdentityStatus.Suspended].includes(state)) ||
      (type === 'fail' &&
        [IdentityStatus.Suspended, IdentityStatus.Zombie].includes(state) &&
        age > 9)

    if (isSafe) return 'safe'

    const isModerateRisk =
      type === 'fail' &&
      [IdentityStatus.Suspended, IdentityStatus.Zombie].includes(state) &&
      age >= 5 &&
      age <= 9

    if (isModerateRisk) return 'moderateRisk'

    const isHighRisk =
      [
        IdentityStatus.Candidate,
        IdentityStatus.Newbie,
        IdentityStatus.Verified,
      ].includes(state) ||
      (type === 'miss' && state === IdentityStatus.Zombie) ||
      (type === 'fail' &&
        (state === IdentityStatus.Verified ||
          (state === IdentityStatus.Suspended && age === 4)))

    if (isHighRisk) return 'highRisk'
  }, [age, state, type])
}

/** @param {{ type: Reason }} */
function useProtectionValue({type}) {
  const [{age}] = useIdentity()

  const level = useProtectionLevel({type})

  switch (level) {
    case 'safe':
      return 1
    case 'moderateRisk':
      return 1 - calculateStakeLoss(age)
    case 'highRisk':
      return 0
    default:
      break
  }
}

/** @param {{ type: Reason }} */
function useProtectionProgress({type}) {
  const [{state, age}] = useIdentity()

  return useMemo(() => {
    switch (state) {
      case IdentityStatus.Candidate:
        return 0.1

      case IdentityStatus.Newbie: {
        if (age === 1) {
          return 0.3
        }
        if (age === 2) {
          return 0.6
        }
        if (age >= 3) {
          return 0.9
        }
        break
      }

      case IdentityStatus.Verified: {
        if (type === 'miss') {
          return 1
        }
        if (type === 'fail') {
          return 0.94
        }
        break
      }

      case IdentityStatus.Human:
        return 1

      case IdentityStatus.Suspended: {
        if (type === 'miss') {
          return 1
        }
        if (type === 'fail') {
          if (age === 4) {
            return 0.1
          }
          if (age >= 5 && age <= 9) {
            return 0.9 + age / 100
          }
          if (age > 9) {
            return 1
          }
        }
        break
      }

      case IdentityStatus.Zombie: {
        if (type === 'miss') {
          return 0.1
        }
        if (type === 'fail') {
          if (age >= 5 && age <= 9) {
            return 0.9 + age / 100
          }
          if (age > 9) {
            return 1
          }
        }
        break
      }

      default:
        return 0
    }

    return 0
  }, [age, state, type])
}

/** @param {{ type: Reason }} */
function useProtectionColor({type}) {
  const level = useProtectionLevel({type})

  const {colors} = useTheme()

  return useMemo(
    () => (level === 'safe' ? colors.blue['500'] : colors.red['500']),
    [colors.blue, colors.red, level]
  )
}

/** @param {{ type: Reason }} */
export function StakeProtectionBadge({type}) {
  const protection = useProtectionValue({type})

  return (
    <Tooltip
      placement="top-start"
      label={<TooltipLabel type={type} />}
      gutter={16}
      bg="graphite.500"
      borderRadius="sm"
      fontWeight="normal"
      p="2"
      pt="1"
    >
      <Stack
        direction="row"
        spacing="2"
        align="center"
        flex={1}
        rounded={20}
        p="1"
        pr="3"
        bg="white"
        borderWidth={1}
        borderColor="rgba(220, 222, 223, 1)"
      >
        <Box>
          <ProtectionProgress type={type} />
        </Box>
        <Box>
          <Text fontSize="12px" fontWeight="medium">
            {type === 'miss' && 'Miss validation'}
            {type === 'fail' && 'Fail validation'}
          </Text>
          <Text fontSize="sm">{toPercent(protection)} stake protection</Text>
        </Box>
      </Stack>
    </Tooltip>
  )
}

/** @param {{ type: Reason }} */
function TooltipLabel({type}) {
  const level = useProtectionLevel({type})
  const protection = useProtectionValue({type})

  const action = type === 'fail' ? 'fail' : 'miss'

  switch (level) {
    case 'safe':
      return (
        <Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Stake protection: 100%
            </Text>
            <Text color="white" lineHeight="4">
              Great job!
            </Text>
          </Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Risk: Low
            </Text>
            <Text color="white" lineHeight="4">
              If you ${action} the upcoming validation your stake will be
              protected
            </Text>
          </Stack>
        </Stack>
      )
    case 'highRisk':
      return (
        <Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Stake protection: 0%
            </Text>
            <Text color="white" lineHeight="4">
              You need to get Human status to get stake protection
            </Text>
          </Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Risk: High
            </Text>
            <Text color="white" lineHeight="4">
              You will lose 100% of the stake if you {action} the upcoming
              validation
            </Text>
          </Stack>
        </Stack>
      )
    case 'moderateRisk':
      return (
        <Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Stake protection: {toPercent(protection)}
            </Text>
            <Text color="white" lineHeight="4">
              You need to get Human status to get stake protection
            </Text>
          </Stack>
          <Stack spacing="0.5">
            <Text color="muted" lineHeight="shorter">
              Risk: Moderate
            </Text>
            <Text color="white" lineHeight="4">
              You will lose {toPercent(1 - protection)} of the stake if you{' '}
              {action}
              the upcoming validation
            </Text>
          </Stack>
        </Stack>
      )

    default:
      break
  }
}

const radius = 16
const innerRadius = 15.5
const circumference = innerRadius * 2 * Math.PI
const angle = 360

const arc = circumference * (angle / 360)
const dashArray = `${arc} ${circumference}`
const transform = `rotate(-90 ${radius} ${radius})`

/** @param {{ type: Reason }} */
function ProtectionProgress({type}) {
  const {colors} = useTheme()

  const progress = useProtectionProgress({type})
  const color = useProtectionColor({type})

  const offset = useMemo(() => arc - progress * arc, [progress])

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      {type === 'miss' && <MissIcon color={color} />}
      {type === 'fail' && <FailIcon color={color} />}

      <circle
        cx={radius}
        cy={radius}
        fill="transparent"
        r={innerRadius}
        stroke={colors.gray[50]}
        strokeWidth={1}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform={transform}
      />
      <circle
        cx={radius}
        cy={radius}
        fill="transparent"
        r={innerRadius}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={transform}
      />
    </svg>
  )
}

const MissIcon = createIcon({
  displayName: 'StakeProtectionMissIcon',
  viewBox: '0 0 32 32',
  path: (
    <path
      d="M19.91 11.8965C19.8896 11.8759 19.8773 11.8486 19.8755 11.8196C19.8736 11.7907 19.8823 11.762 19.9 11.739L20.3425 11.1705C20.3529 11.1573 20.366 11.1464 20.3809 11.1386C20.3958 11.1307 20.4122 11.1262 20.429 11.1251C20.4458 11.1241 20.4627 11.1266 20.4784 11.1325C20.4942 11.1385 20.5085 11.1477 20.5205 11.1595L21.34 11.9795C21.352 11.9914 21.3613 12.0057 21.3673 12.0215C21.3733 12.0373 21.3759 12.0541 21.3749 12.071C21.3738 12.0879 21.3692 12.1043 21.3613 12.1192C21.3534 12.1341 21.3424 12.1472 21.329 12.1575L20.761 12.5995C20.7381 12.6174 20.7095 12.6264 20.6804 12.6246C20.6514 12.6229 20.6241 12.6105 20.6035 12.59L19.91 11.8965ZM16.5 17.361V18C16.5 18.1326 16.4473 18.2598 16.3536 18.3536C16.2598 18.4473 16.1326 18.5 16 18.5C15.8674 18.5 15.7402 18.4473 15.6464 18.3536C15.5527 18.2598 15.5 18.1326 15.5 18V17.361C15.2025 17.188 15 16.869 15 16.5C15 16.1305 15.2025 15.8115 15.5 15.6385V13C15.5 12.8674 15.5527 12.7402 15.6464 12.6464C15.7402 12.5527 15.8674 12.5 16 12.5C16.1326 12.5 16.2598 12.5527 16.3536 12.6464C16.4473 12.7402 16.5 12.8674 16.5 13V15.6385C16.7975 15.8115 17 16.1305 17 16.5C17 16.869 16.7975 17.188 16.5 17.361ZM16.5 11.025V10.5C16.5 10.3674 16.4473 10.2402 16.3536 10.1464C16.2598 10.0527 16.1326 10 16 10C15.8674 10 15.7402 10.0527 15.6464 10.1464C15.5527 10.2402 15.5 10.3674 15.5 10.5V11.025C12.697 11.278 10.5 13.631 10.5 16.5C10.5 19.5375 12.9625 22 16 22C19.0375 22 21.5 19.5375 21.5 16.5C21.5 13.631 19.303 11.278 16.5 11.025Z"
      fill="currentColor"
    />
  ),
  defaultProps: {
    width: '4',
    height: '4',
  },
})

const FailIcon = createIcon({
  displayName: 'StakeProtectionFailIcon',
  viewBox: '0 0 32 32',
  path: (
    <path
      d="M16.5 11.8949C17.5525 12.5584 18.925 12.8264 19.9825 12.9314C19.8455 17.2649 18.919 19.2449 16.5 20.3864C14.0805 19.2434 13.1545 17.2629 13.0175 12.9314C14.074 12.8264 15.4465 12.5584 16.5 11.8949ZM16.6035 20.8899C16.5711 20.9052 16.5358 20.9131 16.5 20.9131C16.4642 20.9131 16.4289 20.9052 16.3965 20.8899C13.681 19.6569 12.628 17.4394 12.511 12.7099C12.5094 12.646 12.5323 12.5838 12.5751 12.5362C12.6178 12.4886 12.6772 12.4591 12.741 12.4539C13.808 12.3674 15.3015 12.1129 16.359 11.3889C16.4006 11.3608 16.4497 11.3458 16.5 11.3458C16.5503 11.3458 16.5994 11.3608 16.641 11.3889C17.6985 12.1129 19.192 12.3674 20.259 12.4539C20.3227 12.4591 20.382 12.4885 20.4247 12.536C20.4675 12.5835 20.4905 12.6455 20.489 12.7094C20.372 17.4394 19.319 19.6569 16.6035 20.8899ZM21.25 11.4949C19.124 11.4949 17.338 10.9459 16.7 10.0949C16.6757 10.0654 16.6452 10.0416 16.6106 10.0253C16.576 10.009 16.5382 10.0005 16.5 10.0005C16.4618 10.0005 16.424 10.009 16.3894 10.0253C16.3548 10.0416 16.3243 10.0654 16.3 10.0949C15.662 10.9459 13.876 11.4949 11.75 11.4949C11.6837 11.4949 11.6201 11.5213 11.5732 11.5681C11.5263 11.615 11.5 11.6786 11.5 11.7449C11.5 16.8524 12.321 20.3464 16.407 21.9819C16.4667 22.0058 16.5333 22.0058 16.593 21.9819C20.679 20.3469 21.5 16.8524 21.5 11.7454C21.5 11.6791 21.4737 11.6155 21.4268 11.5686C21.3799 11.5218 21.3163 11.4954 21.25 11.4954"
      fill="currentColor"
    />
  ),
  defaultProps: {
    width: '4',
    height: '4',
  },
})
