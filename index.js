/* eslint-env node */
const parcel = require('parcel-bundler');
const path = require('path');

const website = path.join(__dirname, './index.html');

const parcelOptions = {
  outDir: './build',
  publicUrl: './',
  watch: false,
  minify: true,
};

const bundler = new parcel(website, parcelOptions);
bundler.bundle();
