var Migrations = artifacts.require("Taboow");
var Migrations1 = artifacts.require("Taboow_CYC");
var Migrations2 = artifacts.require("TaboowCYC2");

module.exports = function(deployer) {
  deployer.deploy(Migrations,"5500000000000000000000000");
  deployer.deploy(Migrations1,"0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e", "0x8cdaf0cd259887258bc13a92c0a6da92698644c0");

  deployer.deploy(Migrations2,"1000000000000000", "Taboow CYC", "TBW", "5", "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2");
};
