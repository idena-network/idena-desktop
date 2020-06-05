import {diff, valid} from 'semver'

export function isHardFork(currentVersion, targetVersion) {
  if (valid(currentVersion) && valid(targetVersion)) {
    return ['minor', 'major'].includes(diff(currentVersion, targetVersion))
  }

  return false
}
