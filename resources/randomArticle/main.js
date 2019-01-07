import { add } from '../rust/src/randomArticle.rs';
console.log(add);
try {
  console.log(add(2, 3));
} catch (err) {
  console.log(err);
}

document.getElementById('link').addEventListener('click', () => {
  console.log(add(2, 3));
});
