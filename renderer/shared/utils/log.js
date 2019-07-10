/* eslint-disable import/prefer-default-export */

export function logConnectivityIssue(resource, error) {
  // eslint-disable-next-line no-console
  console.info(`Error getting ${resource}`, {reason: error.message})
}
