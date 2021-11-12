import {diff, valid} from 'semver'

export function isFork(currentVersion, targetVersion) {
  if (
    currentVersion !== '0.0.1' &&
    valid(currentVersion) &&
    valid(targetVersion)
  ) {
    return ['minor', 'major'].includes(diff(currentVersion, targetVersion))
  }

  return false
}
