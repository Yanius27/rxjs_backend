const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const bodyParser = require('koa-bodyparser');
const { v4: uuidv4 } = require('uuid');
const { faker, ne } = require('@faker-js/faker');

const app = new Koa();

const messages = [];

app.use(koaBody({
  urlencoded: true,
  json: true,
}));

app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.response.body = 'Server response';

  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, PUT');
  ctx.response.set('Access-Control-Allow-Headers', 'Content-Type, x-requested-with');
  
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status = 204;
    return;
  } else {
    await next();

    return;
  }
});

app.use(async (ctx, next) => {
  if (ctx.path === '/messages/unread' && ctx.request.method === 'GET') {
      const response = getRandomData(1);
      ctx.response.body = response;

      await next();

      return;
  }
});

function generateMessage() {
  return {
    id: faker.string.uuid(),
    from: generateShortEmail(),
    subject: faker.company.catchPhrase(),
    body: generateRealisticText(),
    received: Math.floor(Date.now() / 1000),
  };
}

function generateRealisticText() {
  const sentences = [];
  sentences.push(faker.hacker.phrase());
  sentences.push(faker.company.buzzPhrase());
  return sentences.join(' ');
}

function generateShortEmail() {
  const username = faker.internet.userName().split('.').slice(-1).join().split('_').slice(-1);
  const domain = faker.internet.domainName().split('.').slice(-1);
  return `${username}@${domain}`;
}

function getRandomData(count) {
  for (let i = 0; i < count; i++) {
    messages.unshift(generateMessage());
  }

  return {
    status: "ok",
    timestamp: Math.floor(Date.now() / 1000),
    messages: messages,
  }
}

const port = 8090;

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Server is listening to ' + port);
})