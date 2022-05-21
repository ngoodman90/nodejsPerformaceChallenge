const http = require("http");
const url = require('url');
const fs = require('fs');
const port = process.argv[2] || 3000;

const cardsData = fs.readFileSync('./cards.json');
const cardList = [...JSON.parse(cardsData).map(c => JSON.stringify(c))]
const cardListLength = cardList.length
const allCardsResponse = JSON.stringify({id: "ALL CARDS"})

const client = require('redis').createClient()

const requestListener = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const reqUrl = url.parse(req.url, true)
  switch (reqUrl.pathname) {
    case '/card_add':
      res.writeHead(200);
      client.incr(reqUrl.query.id)
        .then(response => response <= cardListLength ?
          res.end(cardList[response - 1]) :
          res.end(allCardsResponse));
      break
    case '/ready':
      res.writeHead(200);
      res.end("{ready: true}");
      break
  }
};

const server = http.createServer(requestListener);

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('ready', () => {
    server.listen(port, '0.0.0.0', () => {
        console.log(`Example app listening at http://0.0.0.0:${port}`)
    })
})

client.connect();