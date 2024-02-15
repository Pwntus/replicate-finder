require('dotenv').config()
const { readFileSync, writeFileSync } = require('node:fs')
const Replicate = require('replicate')
const fetch = require('node-fetch')

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const generateKeywords = async (model) => {
  try {
    console.log('--- label model started')
    const output = await replicate.run('meta/llama-2-70b-chat', {
      input: {
        debug: false,
        top_k: 50,
        top_p: 1,
        temperature: 0.5,
        max_new_tokens: 500,
        min_new_tokens: -1,
        system_prompt: `You are a model labeller. Given the following title and description that has been taken from a catalogue of ML models, generate a comma separated list of search engine keywords. Use keywords that describe use cases if relevant. Just give the comma separated list. Do not write anything else other than the comma separated list. Don't write "Sure, here's a list...".`,
        prompt: `Name: ${model?.name}\nDescription: ${model?.description}`
      }
    })
    const text = output.join('')
    const keywords = text.split(',').map((keyword) => keyword.trim())
    console.log('--- label model... DONE!', keywords)

    return keywords
  } catch (e) {
    console.log('--- failed to label model:', e.message)
    return null
  }
}

const main = async () => {
  try {
    let i = 0
    let next = 'https://api.replicate.com/v1/models'

    while (next) {
      const response = await fetch(next, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      })
      const data = await response.json()
      const results = data?.results || []

      for (const model of results) {
        const keywords = await generateKeywords(model)

        const file_content = readFileSync('./model-keywords.json')
        const file_json = JSON.parse(file_content)
        file_json[`${model?.owner}/${model?.name}`] = {
          description: model?.description,
          keywords
        }
        writeFileSync('./model-keywords.json', JSON.stringify(file_json))
      }

      console.log(`--- page ${i}... DONE!`)
      next = data?.next
      i++
    }
  } catch (e) {
    console.log('Error', e.message)
  }
}

main()
