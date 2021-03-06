import express from 'express';
// VUE
import Vue from 'vue';
const renderer = require('vue-server-renderer').createRenderer();
// REACT
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';

// REACT AND VUE IN ONE FILE!
import App, { createVueApp } from './App';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const server = express();

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('*', async (req, res) => {
    // VUE
    const context = { url: req.url };
    const { app } = createVueApp(context);
    const vueMarkup = await renderer.renderToString(app);

    // REACT
    const reactMarkup = renderToString(
      <StaticRouter context={{}} location={req.url}>
        <App />
      </StaticRouter>
    );

    res.status(200).send(
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
        ${
          process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="vue">${vueMarkup}</div>       
        <div id="react">${reactMarkup}</div>        
    </body>
</html>`
    );
  });

export default server;
