import axios from 'axios'
import nanoid from 'nanoid'
import {signNonce} from '../../../shared/utils/dna-link'

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

export async function voteForKeywordTranslation({id, up}) {
  const timestamp = new Date().toISOString()
  const signature = await signNonce(id.concat(up).concat(timestamp))
  // return await axios.post(`http://api.idena.io/translation/vote`, {
  //   signature,
  //   timestamp,
  //   translationId: id,
  //   up,
  // })
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
      .concat(name)
      .concat(desc)
      .concat(locale)
  )
  return {
    id: nanoid(),
    wordId,
    name,
    desc,
  }
  // return axios.post(`http://api.idena.io/translation`, {
  //   word: wordId,
  //   name,
  //   description: desc,
  //   language: locale,
  //   signature,
  //   timestamp,
  // })
}
