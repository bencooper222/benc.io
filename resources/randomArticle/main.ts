import articleLinks from '../articles.use.json';
import { wasmPick } from '../rust/src/randomArticle.rs';
console.log(wasmPick, wasmPick());
let articleLinksTemp: string[] = articleLinks.slice();
const link: HTMLLinkElement = document.getElementById(
  'link',
) as HTMLLinkElement;
link.target = '_blank';

const pick = () => {
  if (articleLinksTemp.length === 0) {
    // if it's somehow empty, repopulate
    articleLinksTemp = articleLinks.slice();
  }

  // process to randomly select article
  const rand = Math.floor(Math.random() * articleLinksTemp.length);
  const article = articleLinksTemp[rand];
  articleLinksTemp.splice(rand, 1); // remove from selection

  return article;
};

const pickAndSet = (initialLoad = false) => {
  link.href = wasmPick();

  // add listener to change link onclick

  if (!initialLoad) {
    link.innerHTML = 'another reading';
  } // add animation in future?
};

pickAndSet(true);

link.addEventListener('click', () => {
  setTimeout(() => {
    pickAndSet();
  }, 11);
});
