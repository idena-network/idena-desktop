import axios from 'axios'
import {signNonce} from '../../../shared/utils/dna-link'

export function formatKeywords(keywords) {
  return keywords
    .map(({name: [f, ...rest]}) => f.toUpperCase() + rest.join(''))
    .join(' / ')
}

export async function fetchKeywordTranslations(ids, locale) {
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

export async function voteForKeywordTranslation({id, up}) {
  const timestamp = new Date().toISOString()
  const signature = await signNonce(id.concat(up).concat(timestamp))

  const {
    data: {resCode, error},
  } = await axios.post(`https://api.idena.io/translation/vote`, {
    signature,
    timestamp,
    translationId: id,
    up,
  })

  if (resCode > 0 && error) throw new Error(error)

  return {id, up}
}

export async function suggestKeywordTranslation({
  wordId,
  name,
  desc,
  locale = global.locale,
}) {
  const timestamp = new Date().toISOString()

  const signature = await signNonce(
    wordId
      .toString()
      .concat(locale)
      .concat(name)
      .concat(desc)
      .concat(timestamp)
  )

  const {
    data: {resCode, translationId, error},
  } = await axios.post(`https://api.idena.io/translation/translation`, {
    word: wordId,
    name,
    description: desc,
    language: locale,
    signature,
    timestamp,
  })

  if (resCode > 0 && error) throw new Error(error)

  return {
    id: translationId,
    wordId,
    name,
    desc,
  }
}
