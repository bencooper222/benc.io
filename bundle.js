const Parcel = require('parcel-bundler');

const path = require('path');
const fs = require('fs');
const util = require('util');
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient(process.env.BITLY_API_KEY);

const fs_writeFile = util.promisify(fs.writeFile);

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

(async () => {
  const oldArticles = JSON.parse(fs.readFileSync('resources/articles.json', 'utf8'));

  fs_writeFile(
    'resources/articles.use.json',
    JSON.stringify(
      await Promise.all(
        oldArticles.map(article => {
          return bitly
            .shorten(article)
            .then(res => {
              return res.link.substring(0, 5) === 'https'
                ? res.link
                : `https${res.link.substring(4)}`;
            })
            .catch(err => {
              console.error(err);
              process.exit(1);
            });
        }),
      ),
    ),
    'utf8',
  ).then(() => {
    const bundler = new Parcel(path.join(__dirname, './index.html'), {
      publicUrl: './',
      watch: false,
      minify: true,
      scopeHoist: false,
    });
    bundler.bundle();
  });
})();
