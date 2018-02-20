const CoinHive = require('coin-hive');

(async () => {
    // Create miner
    const miner = await CoinHive('Z9xViG5bUBovkUbtaKnxbo0CNHGiaFa0', { throttle: .68 }); // CoinHive's Site Key

    // Start miner
    await miner.start();

});