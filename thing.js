const tableRows = document.getElementById('table-1').rows;
const parcePercent = percentString => parseFloat(percentString) / 100.0;

const getDeepestChild = obj => {
  // gets the span with the champ name in it
  const children = Array.from(obj.childNodes).filter(
    node => node.nodeName !== '#text'
  );
  if (children.length === 0) {
    return obj;
  } else if (children.length === 1) {
    return getDeepestChild(children[0]);
  } else if (children.length === 2) {
    return children[1];
  }
};

const championData = [];
for (let rowIndex = 2; rowIndex < tableRows.length; rowIndex++) {
  //   console.log(rowIndex);
  const tableCells = tableRows[rowIndex].cells;
  const champName = getDeepestChild(tableCells[1]).innerHTML;

  const winPercent = parcePercent(tableCells[3].childNodes[1].innerHTML);
  const playPercent = parcePercent(tableCells[4].innerHTML);

  const champExistIndex = championData.findIndex(
    champ => champ.name === champName
  );
  console.log(champExistIndex);
  if (champExistIndex === -1) {
    championData.push({
      name: champName,
      winPercent,
      playPercent
    });
  } else {
    if (championData[champExistIndex].others == undefined) {
      championData[champExistIndex].others = [];
    }
    championData[champExistIndex].others.push({
      winPercent,
      playPercent
    });
  }
}
// console.log(championData);

for (const champ of championData) {
  let power = 0;
  if (champ.others != undefined) {
    for (const playDataPairs of champ.others) {
      power += playDataPairs.winPercent * playDataPairs.playPercent * 1000;
      //   console.log(champ.name,power)
    }
  }
  power += champ.power = champ.winPercent * champ.playPercent * 1000;
  //   console.log(champ.name,power)
  champ.power = power;
}

championData.sort((a, b) => b.power - a.power);

window.open(
  `https://benc.me/championgg-parser.html?data=${JSON.stringify(championData)}`,
  '_blank'
);
