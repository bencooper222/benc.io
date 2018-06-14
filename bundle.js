/* eslint-env node */
const Parcel = require('parcel-bundler');
const path = require('path');
const BitlyClient = require('bitly');
const fs = require('fs');
const util = require('util');

const fs_writeFile = util.promisify(fs.writeFile); // eslint-disable-line camelcase
const Sequence = require('@lvchengbin/sequence');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // eslint-disable-line import/no-extraneous-dependencies, global-require
}

const website = path.join(__dirname, './index.html');

const parcelOptions = {
  outDir: './build',
  publicUrl: './',
  watch: false,
  minify: true,
 scopeHoist: true,
};

const minifyArticles = async () => {
  const bitly = BitlyClient(process.env.BITLY_API_KEY);
  const oldArticles = JSON.parse(
    fs.readFileSync('resources/articles.json', 'utf8')
  );

  const minArticles = [];
  const sequence = new Sequence();
  // This runs every time bit.ly responds - even with a not 200 status code
  sequence.on('success', (data, index) => {
    try {
      minArticles.push(
        data.value.data.url.substring(0, 5) === 'https'
          ? data.value.data.url
          : `https${data.value.data.url.substring(4)}`
      );
    } catch (err) {
      minArticles.push(data.value); // we just push the normal value if one fails
      console.log(`${data.value} was not minimized`);
    }

    console.log(
      index % 4 === 0 || index + 1 === oldArticles.length
        ? `${index + 1} of ${oldArticles.length} complete.`
        : ''
    );
  });

  // this runs every time the Promise itself fails - usually an API token misconfig
  sequence.on('failed', (data, index) => {
    console.log(data, index);
    // execute when each step in sequence failed
  });

  oldArticles.forEach(article => {
    const articleMinifier = async () => {
      try {
        return await bitly.shorten(article);
      } catch (e) {
        console.log(e);
        return article;
      }
    };
    sequence.append(articleMinifier);
  });

  // this runs after every link has beeen retrieved from bit.ly
  sequence.on('end', () =>
    fs_writeFile(
      'resources/articles.use.json',
      JSON.stringify(minArticles),
      'utf8'
    ).then(() => {
      const bundler = new Parcel(website, parcelOptions);
      bundler.bundle();
    })
  );
};

minifyArticles();
