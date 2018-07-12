declare module '*.json' {
  const value: any;
  export default value;
}

import * as articleLinks from '../articles.use.json';

let articleLinksTemp: string[] = articleLinks.slice();
const link: HTMLLinkElement = document.getElementById(
  'link'
) as HTMLLinkElement;
link.target = '_blank';

const randomPick = (initialLoad = false) => {
  if (articleLinksTemp.length === 0) {
    // if it's somehow empty, repopulate
    articleLinksTemp = articleLinks.slice();
  }

  // process to randomly select article
  const rand: number = Math.floor(Math.random() * articleLinksTemp.length);
  link.href = articleLinksTemp[rand];

  // add listener to change link onclick

  articleLinksTemp.splice(rand, 1); // remove from selection
  if (!initialLoad) {
    link.innerHTML = 'another reading';
  } // add animation in future?
};

randomPick(true);

link.addEventListener('click', () => {
  setTimeout(() => {
    randomPick();
  }, 11);
});
