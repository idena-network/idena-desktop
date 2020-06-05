export function formatKeywords(keywords) {
  return keywords
    .map(({name: [f, ...rest]}) => f.toUpperCase() + rest.join(''))
    .join(' / ')
}

export async function fetchKeywordTranslations(ids, locale = 'zh') {
  return (
    await Promise.all(
      ids.map(async id =>
        (
          await fetch(
            `http://api.idena.io/translation/word/${id}/language/${locale}/translations`
          )
        ).json()
      )
    )
  ).map(({translations}) =>
    translations.map(
      ({
        id,
        name,
        description: desc,
        confirmed,
        upVotes: ups,
        downVotes: downs,
      }) => ({
        id,
        name,
        desc,
        confirmed,
        ups,
        downs,
      })
    )
  )
}
