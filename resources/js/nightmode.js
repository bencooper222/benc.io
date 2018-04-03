// adjust day night thing
import SunCalc from 'suncalc';
//import moment from 'moment-timezone';

const changeBackground = document.getElementsByTagName('body');
const changeColor = colorToChangeElements();

function colorToChangeElements() {
  let icons = document.getElementsByTagName('i');
  let svgs = document.getElementsByClassName('not-fa');

  let h2 = document.getElementsByTagName('h2');
  let h3 = document.getElementsByTagName('h3');

  return addArrays([icons, h2, h3, svgs]);
}

function addArrays(arrays) {
  // arrays is an array of arrays
  let rtn = [];

  for (let i = 0; i < arrays.length; i++) {
    rtn = rtn.concat(Array.from(arrays[i]));
  }

  return rtn;
}

function makeDay() {
  for (let i = 0; i < changeBackground.length; i++) {
    console.log();
    changeBackground[i].style.backgroundColor = 'white';
  }

  for (let i = 0; i < changeColor.length; i++) {
    changeColor[i].style.color = 'black';
  }
}

function makeNight() {
  for (let i = 0; i < changeBackground.length; i++) {
    console.log();
    changeBackground[i].style.backgroundColor = 'black';
  }

  for (let i = 0; i < changeColor.length; i++) {
    changeColor[i].style.color = 'white';
  }
}

function getSunriseSunsetTimes() {
  return fetch('https://freegeoip.net/json/')
    .then(location => {
      return location.json();
    })
    .then(coords => {
      let sunTimes = SunCalc.getTimes(
        new Date(),
        coords.latitude,
        coords.longitude,
      );
      return { start: sunTimes.dawn, stop: sunTimes.sunset };
    })
    .then(data => {
      let civilBegin = moment.tz(data.start, moment.tz.guess());
      let civilEnd = moment.tz(data.stop, moment.tz.guess());

      let civilTimes = {
        begin: civilBegin,
        end: civilEnd,
      };

      return civilTimes;
    });
}

function calculateCorrectState() {
  getSunriseSunsetTimes().then(function(data) {
    let now = moment();
    if (now.isAfter(data.begin) && now.isBefore(data.end)) {
      console.log(
        'It is between: ' +
          data.begin.format('MMMM Do YYYY, h:mm:ss a') +
          ' and ' +
          data.end.format('MMMM Do YYYY, h:mm:ss a'),
      );
      stateSwicher('day');
      setLocalStorage('day', data.begin, data.end);
    } else {
      console.log(
        'It is either before ' +
          data.begin.format('MMMM Do YYYY, h:mm:ss a') +
          ' or after ' +
          data.end.format('MMMM Do YYYY, h:mm:ss a'),
      );

      stateSwicher('night');
      setLocalStorage('night', data.begin, data.end);
    }
  });
}

function setState() {
  let cache;
  try {
    cache = JSON.parse(localStorage.getItem('state'));
  } catch (err) {
    console.log('Cache parsing failed, manual calculations');
    calculateCorrectState();
    return;
  }

  if (cache == null) {
    console.log('No cache, manual calculations');
    calculateCorrectState();
    return;
  }

  if (moment.tz.guess() !== cache.tz) {
    console.log('Cache indicated changed timezone.');
    calculateCorrectState();
    return;
  }

  if (moment().isBefore(cache.until)) {
    console.log('Cache indicated state should not change.');
    stateSwicher(cache.state);
  } else {
    console.log(
      'Cache indicated state should change. Using designated new state and recalculating cache',
    );
    stateSwicher(cache.then);
    calculateCorrectState();
  }
}

function stateSwicher(state) {
  switch (state) {
    case 'day':
      makeDay();
      break;
    case 'night':
      makeNight();
      break;
    default:
      //recalculate included
      calculateCorrectState();
      break;
  }
}

function setLocalStorage(state, startDayTime, endDayTime) {
  let toStore = {};
  toStore.tz = startDayTime.tz();
  if (state === 'day') {
    toStore.state = 'day';
    toStore.until = endDayTime.format();
    toStore.then = 'night';
  } else if (state === 'night') {
    if (moment().isBefore(endDayTime)) {
      toStore.state = 'night';
      toStore.until = startDayTime.format();
      toStore.then = 'day';
    } else {
      toStore.state = 'night';
      toStore.until = moment().endOf('day');
      toStore.then = 'recalculate';
    }
  }

  localStorage.setItem('state', JSON.stringify(toStore));
}

setState();
