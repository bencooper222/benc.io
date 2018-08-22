declare const process: any;

import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc';

// declares what the cache will look like
interface ICache {
  state: string;
  until: string;
  then: string;
  tz: string;
}

const ENABLE_CACHE =
  // tslint:disable-next-line:triple-equals
  process.env.ENABLE_CACHE == undefined
    ? true
    : process.env.ENABLE_CACHE === 'true';

const colorToChangeElements = (): HTMLElement[] =>
  [
    Array.from(document.getElementsByTagName('path')),
    Array.from(document.getElementsByTagName('h2')),
    Array.from(document.getElementsByTagName('h3')),
    Array.from(document.getElementsByClassName('not-fa')),
  ].reduce((acc, arr) => {
    acc.push(...arr);
    return acc;
  }, []) as HTMLElement[];

const makeDefinedPeriod = (period: string) => {
  const isNight = period === 'night' ? true : false;

  const changeBackground = Array.from(document.getElementsByTagName('body'));
  const changeColor = Array.from(colorToChangeElements());

  changeBackground.forEach(backgroundEl => {
    backgroundEl.style.backgroundColor = isNight ? 'black' : 'white';
  });

  changeColor.forEach(colorEl => {
    colorEl.style.color = isNight ? 'white' : 'black';
  });
};

const getSunriseSunsetTimes = (): Promise<{
  begin: DateTime;
  end: DateTime;
}> => {
  return fetch('https://freegeoip.app/json/')
    .then(location => {
      return location.json();
    })
    .then(coords => {
      const sunTimes = SunCalc.getTimes(
        new Date(),
        coords.latitude,
        coords.longitude,
      );

      return { start: sunTimes.dawn, stop: sunTimes.sunset };
    })
    .then(data => {
      // const format = '';
      return {
        begin: DateTime.fromISO(data.start.toISOString()),
        end: DateTime.fromISO(data.stop.toISOString()),
      };
    });
};

const calculateCorrectState = () => {
  getSunriseSunsetTimes().then(data => {
    const now: DateTime = DateTime.local();
    if (now > data.begin && now < data.end) {
      console.log(
        `It is between: ${data.begin.toLocaleString(
          DateTime.DATETIME_FULL,
        )} and ${data.end.toLocaleString(DateTime.DATETIME_FULL)}`,
      );
      stateSwitcher('day');
      setLocalStorage('day', data.begin, data.end);
    } else {
      console.log(
        `It is either before ${data.begin.toLocaleString(
          DateTime.DATETIME_FULL,
        )} or after ${data.end.toLocaleString(DateTime.DATETIME_FULL)}`,
      );

      stateSwitcher('night');
      setLocalStorage('night', data.begin, data.end);
    }
  });
};

const stateSwitcher = (state: string) => {
  switch (state) {
    case 'day':
      makeDefinedPeriod('day');
      break;
    case 'night':
      makeDefinedPeriod('night');
      break;
    default:
      // recalculate included
      calculateCorrectState();
      break;
  }
};

const setLocalStorage = (
  state: string,
  startDayTime: DateTime,
  endDayTime: DateTime,
) => {
  if (!ENABLE_CACHE || process.env.FORCED_STATE) {
    return;
  } // env variable
  const toStore: ICache = {} as ICache;
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

(() => {
  let cache: ICache;

  if (process.env.FORCED_STATE) {
    if (process.env.FORCED_STATE === 'night') {
      stateSwitcher('night');
    } else {
      stateSwitcher('day');
    }
    console.log(`State was forced to ${process.env.FORCED_STATE}`);

    return;
  }

  const now: DateTime = DateTime.local(); // used later in code
  try {
    // checks constant to see if it should cache
    cache = ENABLE_CACHE
      ? JSON.parse(localStorage.getItem('state') || '{}')
      : undefined;
  } catch (err) {
    console.log('Cache parsing failed, manual calculations');
    calculateCorrectState();
    return;
  }

  // loose equality needed
  // tslint:disable-next-line:triple-equals
  if (cache == undefined) {
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

  const cacheUntilEnd = DateTime.fromISO(cache.until);

  if (now < cacheUntilEnd) {
    console.log('Cache indicated state should not change.');
    stateSwitcher(cache.state);
  } else {
    console.log(
      'Cache indicated state should change. Using designated new state and recalculating cache',
    );
    stateSwitcher(cache.then);
    calculateCorrectState();
  }
})();
