declare module '*.json' {
  const value: any;
  export default value;
}

import articleLinks from '../articles.use.json';

let articleLinksTemp: string[] = articleLinks;
const link: HTMLLinkElement = document.getElementById(
  'link',
) as HTMLLinkElement;
link.target = '_blank';

const randomPick = () => {
  if (articleLinksTemp.length === 0) {
    // if it's somehow empty, repopulate
    articleLinksTemp = articleLinks;
  }

  // process to randomly select article
  const rand: number = Math.floor(Math.random() * articleLinks.length);
  const article: string = articleLinksTemp[rand];
  link.href = article;

  // add listener to change link onclick

  link.addEventListener('click', () => {
    setTimeout(() => {
      articleLinksTemp.splice(rand, 1); // remove from selection
      link.innerHTML = 'another reading'; // add animation in future?
      randomPick();
    }, 11);
  });
};

randomPick();
