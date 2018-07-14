var Migrations = artifacts.require("Taboow");
var Migrations1 = artifacts.require("Taboow_Broker");
var Migrations2 = artifacts.require("TaboowCYC2");

module.exports = function(deployer) {
  deployer.deploy(Migrations,"5500000000000000000000000", "0x627306090abaB3A6e1400e9345bC60c78a8BEf57");
  deployer.deploy(Migrations1,"0x8cdaf0cd259887258bc13a92c0a6da92698644c0", "0x627306090abaB3A6e1400e9345bC60c78a8BEf57");

  deployer.deploy(Migrations2,"1000000000000000", "Taboow CYC", "TBW", "5", "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2");
};
