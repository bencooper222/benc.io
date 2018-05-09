/* eslint-env node */
const Parcel = require('parcel-bundler');
const path = require('path');
const BitlyClient = require('bitly');
const fs = require('fs');
const util = require('util');

const fs_writeFile = util.promisify(fs.writeFile); // eslint-disable-line camelcase
const Sequence = require('@lvchengbin/sequence');

const website = path.join(__dirname, './index.html');

const parcelOptions = {
  outDir: './build',
  publicUrl: './',
  watch: false,
  minify: true,
};

const minifyArticles = async () => {
  const bitly = BitlyClient(process.env.BITLY_API_KEY);
  const oldArticles = JSON.parse(
    fs.readFileSync('resources/articles.json', 'utf8'),
  );
  const minArticles = [];
  const sequence = new Sequence();
  sequence.on('success', (data, index) => {
    try{
      minArticles.push(data.value.data.url)

    }
    catch(err){
      minArticles.push(data.value);
      console.log(`${data.value  } was not minimized`);
    }
    console.log(index % 4 === 0 ? `${index+1  } of ${  oldArticles.length  } complete`:'');
  });

  sequence.on('failed', (data, index) => {
    console.log(data, index);
    // execute when each step in sequence failed
  });

  sequence.on('end', () => fs_writeFile(
      'resources/articles.use.json',
      JSON.stringify(minArticles),
      'utf8',
    ).then(()=>{
      const bundler = new Parcel(website, parcelOptions);
      bundler.bundle();
    }));

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


};

minifyArticles();

