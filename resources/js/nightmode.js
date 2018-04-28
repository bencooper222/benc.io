/* global process */
import SunCalc from 'suncalc';
import { DateTime } from 'luxon';

const ENABLE_CACHE =
  process.env.ENABLE_CACHE == null ? true : process.env.ENABLE_CACHE == 'true';

const changeBackground = document.getElementsByTagName('body');
const changeColor = colorToChangeElements();

function addArrays(arrays) {

const addArrays = arrays => {
  // arrays is an array of arrays
  let rtn = [];

  for (let i = 0; i < arrays.length; i++) {
    rtn = rtn.concat(Array.from(arrays[i]));
  }

  return rtn;
};


function colorToChangeElements() {
  let icons = document.getElementsByTagName('i');
  let svgs = document.getElementsByClassName('not-fa');

  let h2 = document.getElementsByTagName('h2');
  let h3 = document.getElementsByTagName('h3');

  return addArrays([icons, h2, h3, svgs]);
}


const makeDay = () => {
  for (let i = 0; i < changeBackground.length; i++) {
    changeBackground[i].style.backgroundColor = 'white';
  }

  for (let i = 0; i < changeColor.length; i++) {
    changeColor[i].style.color = 'black';
  }
};

const makeNight = () => {
  for (let i = 0; i < changeBackground.length; i++) {
    console.log();
    changeBackground[i].style.backgroundColor = 'black';
  }

  for (let i = 0; i < changeColor.length; i++) {
    changeColor[i].style.color = 'white';
  }
};

const getSunriseSunsetTimes = () => {
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
      // const format = '';
      let civilBegin = DateTime.fromISO(data.start.toISOString());
      let civilEnd = DateTime.fromISO(data.stop.toISOString());

      let civilTimes = {
        begin: civilBegin,
        end: civilEnd,
      };

      return civilTimes;
    });
};

const calculateCorrectState = () => {
  getSunriseSunsetTimes().then(function(data) {
    let now = DateTime.local();
    if (now > data.begin && now < data.end) {
      console.log(
        'It is between: ' +
          data.begin.toLocaleString(DateTime.DATETIME_FULL) +
          ' and ' +
          data.end.toLocaleString(DateTime.DATETIME_FULL),
      );
      stateSwicher('day');
      setLocalStorage('day', data.begin, data.end);
    } else {
      console.log(
        'It is either before ' +
          data.begin.toLocaleString(DateTime.DATETIME_FULL) +
          ' or after ' +
          data.end.toLocaleString(DateTime.DATETIME_FULL),
      );

      stateSwicher('night');
      setLocalStorage('night', data.begin, data.end);
    }
  });
};

const setState = () => {
  let cache;
  const now = DateTime.local(); // used later in code
  try {
    // checks constant to see if it should cache
    cache = ENABLE_CACHE ? JSON.parse(localStorage.getItem('state')) : null;
    if (cache != null) cache.until = DateTime.fromISO(cache.until); // parse ISO strings
  } catch (err) {
    console.log('Cache parsing failed, manual calculations');
    calculateCorrectState();
    return;
  }

  if (cache == null) {
    if (ENABLE_CACHE) {
      console.log('No cache, manual calculations');
    } else {
      console.log('ENABLE_CACHE is set to false, manual calculations');
    }

    calculateCorrectState();
    return;
  }

  if (now.zoneName !== cache.tz) {
    console.log('Cache indicated changed timezone.');
    calculateCorrectState();
    return;
  }

  if (now < cache.until) {
    console.log('Cache indicated state should not change.');
    stateSwicher(cache.state);
  } else {
    console.log(
      'Cache indicated state should change. Using designated new state and recalculating cache',
    );
    stateSwicher(cache.then);
    calculateCorrectState();
  }
};

const stateSwicher = state => {
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
};

const setLocalStorage = (state, startDayTime, endDayTime) => {
  if (!ENABLE_CACHE) return; // env variable
  let toStore = {};
  const now = DateTime.local();
  toStore.tz = startDayTime.zoneName;
  if (state === 'day') {
    toStore.state = 'day';
    toStore.until = endDayTime.toISO();
    toStore.then = 'night';
  } else if (state === 'night') {
    if (now < endDayTime) {
      toStore.state = 'night';
      toStore.until = startDayTime.toISO();
      toStore.then = 'day';
    } else {
      toStore.state = 'night';
      toStore.until = now.endOf('day').toISO();
      toStore.then = 'recalculate';
    }
  }

  localStorage.setItem('state', JSON.stringify(toStore));
};

const changeBackground = document.getElementsByTagName('body');
const changeColor = colorToChangeElements();
setState();
