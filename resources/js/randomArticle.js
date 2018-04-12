const articleLinks = [
  'https://waitbutwhy.com/2014/05/fermi-paradox.html',
  'http://www.freedomtomarry.org/pages/how-it-happened',
  'https://12factor.net/',
  'https://www.martincwiner.com/wp-content/uploads/2011/06/The-Last-Question-Isaac-Asimov.pdf',
  'https://www.vox.com/new-money/2016/12/9/13881712/move-government-to-midwest',
  'https://www.poetryfoundation.org/poems/46565/ozymandias',
  'https://www.nps.gov/stli/learn/historyculture/colossus.htm',
  'https://waitbutwhy.com/2015/11/the-cook-and-the-chef-musks-secret-sauce.html',
  'https://www.theatlantic.com/magazine/archive/2016/04/the-obama-doctrine/471525/',
  'https://fivethirtyeight.com/features/science-isnt-broken/',
  'http://www.slate.com/blogs/the_slatest/2015/06/26/supreme_court_legalizes_gay_marriage_here_is_the_beautiful_last_paragraph.html',
  'https://www.dailykos.com/stories/2014/9/10/1328813/-The-Astonishing-Story-of-the-Federal-Reserve-on-9-11',
  'https://chihacknight.org/blog/2015/11/23/10-lessons-from-organizing-the-chi-hack-night.html',
  'http://firstround.com/review/Asanas-Justin-Rosenstein-on-the-One-Quality-Every-Startup-Needs-to-Survive/',
  'https://www.troyhunt.com/on-the-perceived-value-ev-certs-cas-phishing-lets-encrypt/',
  'https://content.time.com/time/subscriber/article/0,33009,2136864,00.html',
  'https://www.theatlantic.com/technology/archive/2015/07/the-secret-startup-saved-healthcare-gov-the-worst-website-in-america/397784/',
  'https://www.theatlantic.com/education/archive/2017/11/the-surprising-revolt-at-reed/544682/?utm_source=vxfb',
  'https://www.motherjones.com/politics/2016/06/cca-private-prisons-corrections-corporation-inmates-investigation-bauer/',
  'https://www.nytimes.com/interactive/2017/01/18/upshot/some-colleges-have-more-students-from-the-top-1-percent-than-the-bottom-60.html',
  'https://www.politico.com/interactives/2017/top-college-rankings-list-2017-us-news-investigation/',
  'https://www.stilldrinking.org/programming-sucks',
  'https://blogs.scientificamerican.com/psysociety/benevolent-sexism/',
  'http://questioncopyright.org/promise',
  'https://www.vox.com/2014/9/13/6135905/open-borders-bryan-caplan-interview-gdp-double',
]; // who needs config variables?

let articleLinksTemp = articleLinks;
const link = document.getElementById('link');
link.target = '_blank';

const randomPick = () => {
  if (articleLinksTemp.length === 0) {
    // if it's somehow empty, repopulate
    articleLinksTemp = articleLinks;
  }

  // process to randomly select article
  let rand = Math.floor(Math.random() * articleLinks.length);
  let article = articleLinksTemp[rand];
  link.href = article;

  // add listener to change link onclick

  link.addEventListener('click', () => {
    setTimeout(() => {
      articleLinksTemp.splice(rand, 1); //remove from selection
      link.innerHTML = 'another reading'; // add animation in future?
      randomPick();
    }, 11);
  });
};

randomPick();
