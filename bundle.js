const Parcel = require('parcel-bundler');
const BitlyClient = require('bitly');

const path = require('path');
const fs = require('fs');
const util = require('util');

const fs_writeFile = util.promisify(fs.writeFile);

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

(() => {
  const bitly = BitlyClient(process.env.BITLY_API_KEY);
  const oldArticles = JSON.parse(
    fs.readFileSync('resources/articles.json', 'utf8')
  );

  const minArticles = [];
  const minReqs = [];
  oldArticles.forEach(article => {
    minReqs.push(
      bitly
        .shorten(article)
        .then(minArticle => {
          minArticles.push(
            minArticle.data.url.substring(0, 5) === 'https'
              ? minArticle.data.url
              : `https${minArticle.data.url.substring(4)}`
          );
        })
        .catch(err => {
          console.log(err);
          minArticles.push(article);
        })
    );
  });
  Promise.all(minReqs).then(() => {
    fs_writeFile(
      'resources/articles.use.json',
      JSON.stringify(minArticles),
      'utf8'
    ).then(() => {
      const bundler = new Parcel(path.join(__dirname, './index.html'), {
        outDir: './build',
        publicUrl: './',
        watch: false,
        minify: true,
        scopeHoist: false
      });
      bundler.bundle();
    });
  });
})();
