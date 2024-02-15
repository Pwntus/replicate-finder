# Replicate finder

> Proof of concept using language models to label models used for keyword search.

A pre-labelled list of models is included in this repo at [model-keywords.json](./model-keywords.json)

## Quickstart

```
npm install
```

Get your Replicate API token, insert it into `.env.example` and rename the file to `.env`.

Start generating keywords for all public models:

```
node generate_keywords.js
```

## Run a server locally

```
npm run dev
```

This will start a local web server at [http://localhost:8080](http://localhost:8080) where you can search through the generated JSON list of keywords.
