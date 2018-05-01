declare var process: any;

import SunCalc from "suncalc";
import { DateTime } from "luxon";

interface Cache {
  state: string;
  until: string;
  then: string;
  tz: string;
}


const ENABLE_CACHE =
  process.env.ENABLE_CACHE === undefined
    ? true
    : process.env.ENABLE_CACHE === "true";

function addArrays(arrays: HTMLElement[][]): HTMLElement[] {
  // arrays is an array of arrays
  const rtn = [];

  for (let i = 0; i < arrays.length; i++) {
    for (let j = 0; j < arrays[i].length; j++) {
      rtn.push(arrays[i][j]);
    }
  }

  return rtn;
}

function colorToChangeElements(): HTMLElement[] {
  const icons = Array.prototype.slice.call(document.getElementsByTagName("i"), 0);
  const svgs = Array.prototype.slice.call(document.getElementsByClassName("not-fa"), 0);

  const h2 = Array.prototype.slice.call(document.getElementsByTagName("h2"), 0);
  const h3 = Array.prototype.slice.call(document.getElementsByTagName("h3"), 0);

  return addArrays([icons, h2, h3, svgs]);
}

const makeDefinedPeriod = period => {
  let isNight = false;

  if (period === "night") {
    isNight = true;
  }
  // defaults day
  for (let i = 0; i < changeBackground.length; i++) {
    changeBackground[i].style.backgroundColor = isNight ? "black" : "white";
  }

  for (let i = 0; i < changeColor.length; i++) {
    changeColor[i].style.color = isNight ? "white" : "black";
  }
};

const getSunriseSunsetTimes = () => {
  return fetch("https://freegeoip.net/json/")
    .then(location => {
      return location.json();
    })
    .then(coords => {
      const sunTimes = SunCalc.getTimes(
        new Date(),
        coords.latitude,
        coords.longitude
      );

      return { start: sunTimes.dawn, stop: sunTimes.sunset };
    })
    .then(data => {
      // const format = '';
      const civilBegin = DateTime.fromISO(data.start.toISOString());
      const civilEnd = DateTime.fromISO(data.stop.toISOString());

      const civilTimes = {
        begin: civilBegin,
        end: civilEnd
      };

      return civilTimes;
    });
};

const calculateCorrectState = () => {
  getSunriseSunsetTimes().then(function(data) {
    const now = DateTime.local();
    if (now > data.begin && now < data.end) {
      console.log(
        "It is between: " +
          data.begin.toLocaleString(DateTime.DATETIME_FULL) +
          " and " +
          data.end.toLocaleString(DateTime.DATETIME_FULL)
      );
      stateSwicher("day");
      setLocalStorage("day", data.begin, data.end);
    } else {
      console.log(
        "It is either before " +
          data.begin.toLocaleString(DateTime.DATETIME_FULL) +
          " or after " +
          data.end.toLocaleString(DateTime.DATETIME_FULL)
      );

      stateSwicher("night");
      setLocalStorage("night", data.begin, data.end);
    }
  });
};

const setState = () => {
  let cache: Cache;

  const now = DateTime.local(); // used later in code
  try {
    // checks constant to see if it should cache
    cache = ENABLE_CACHE
      ? JSON.parse(localStorage.getItem("state"))
      : undefined;


  } catch (err) {
    console.log("Cache parsing failed, manual calculations");
    calculateCorrectState();
    return;
  }

  // tslint:disable-next-line:triple-equals
  if (cache == undefined) {
    if (ENABLE_CACHE) {
      console.log("No cache, manual calculations");
    } else {
      console.log("ENABLE_CACHE is set to false, manual calculations");
    }

    calculateCorrectState();
    return;
  }

  if (now.zoneName !== cache.tz) {
    console.log("Cache indicated changed timezone.");
    calculateCorrectState();
    return;
  }

  let cacheUntilEnd: DateTime;
  if (cache !== undefined) cacheUntilEnd = DateTime.fromISO(cache.until); // parse ISO strings
  if (now < cacheUntilEnd) {
    console.log("Cache indicated state should not change.");
    stateSwicher(cache.state);
  } else {
    console.log(
      "Cache indicated state should change. Using designated new state and recalculating cache"
    );
    stateSwicher(cache.then);
    calculateCorrectState();
  }
};

const stateSwicher = state => {
  switch (state) {
    case "day":
      makeDefinedPeriod("day");
      break;
    case "night":
      makeDefinedPeriod("night");
      break;
    default:
      // recalculate included
      calculateCorrectState();
      break;
  }
};

const setLocalStorage = (state, startDayTime, endDayTime) => {
  if (!ENABLE_CACHE) return; // env variable
  const toStore: Cache = <Cache>{};
  const now = DateTime.local();
  toStore.tz = startDayTime.zoneName;
  if (state === "day") {
    toStore.state = "day";
    toStore.until = endDayTime.toISO();
    toStore.then = "night";
  } else if (state === "night") {
    if (now < endDayTime) {
      toStore.state = "night";
      toStore.until = startDayTime.toISO();
      toStore.then = "day";
    } else {
      toStore.state = "night";
      toStore.until = now.endOf("day").toISO();
      toStore.then = "recalculate";
    }
  }

  localStorage.setItem("state", JSON.stringify(toStore));
};

const changeBackground = document.getElementsByTagName("body");
const changeColor = colorToChangeElements();

setState();
