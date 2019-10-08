Upgrades = {
  
  types : {
    energyRate:"energyRate",
    energyCap:"energyCap",
    damage:"damage",
    health:"health",
    speed:"speed",
    bloodCap:"bloodCap",
    brainsCap:"brainsCap",
    brainRecoverChance:"brainRecoverChance",
    riseFromTheDeadChance:"riseFromTheDeadChance",
    graveyard:"graveyard",
    boneCollectorCapacity:"boneCollectorCapacity"
  },

  costs : {
    energy : "energy",
    blood : "blood",
    brains : "brains",
    bones : "bones"
  },

  applyUpgrades() {
    GameModel.resetToBaseStats();
    for (var i = 0; i < GameModel.persistentData.upgrades.length; i++) {
      this.applyUpgrade(GameModel.persistentData.upgrades[i]);
    }
  },

  applyUpgrade(upgrade) {
    switch (upgrade.type) {
      case this.types.energyRate:
        GameModel.energyRate += upgrade.effect * upgrade.rank;
        return;
      case this.types.energyCap:
        GameModel.energyMax += upgrade.effect * upgrade.rank;
        return;
      case this.types.bloodCap:
        GameModel.bloodMax += upgrade.effect * upgrade.rank;
        return;
      case this.types.brainsCap:
        GameModel.brainsMax += upgrade.effect * upgrade.rank;
        return;
      case this.types.damage:
        GameModel.zombieDamage += upgrade.effect * upgrade.rank;
        return;
      case this.types.speed:
        GameModel.zombieSpeed += upgrade.effect * upgrade.rank;
        return;
      case this.types.health:
        GameModel.zombieHealth += upgrade.effect * upgrade.rank;
        return;
      case this.types.brainRecoverChance:
        GameModel.brainRecoverChance += upgrade.effect * upgrade.rank;
        return;
      case this.types.riseFromTheDeadChance:
        GameModel.riseFromTheDeadChance += upgrade.effect * upgrade.rank;
        return;
      case this.types.graveyard:
        GameModel.graveyard = 1;
        return;
      case this.types.boneCollectorCapacity:
        GameModel.boneCollectorCapacity += upgrade.effect * upgrade.rank;
        return;
    }
  },

  displayStatValue(upgrade) {
    switch (upgrade.type) {
      case this.types.energyRate:
        return "Energy rate: " + GameModel.energyRate + " per second";
      case this.types.energyCap:
        return "Maximum energy: " + GameModel.energyMax;
      case this.types.bloodCap:
        return "Maximum blood: " + GameModel.bloodMax;
      case this.types.brainsCap:
        return "Maximum brains: " + GameModel.brainsMax;
      case this.types.damage:
        return "Zombie damage: " + GameModel.zombieDamage;
      case this.types.speed:
        return "Zombie speed: " + GameModel.zombieSpeed;
      case this.types.health:
        return "Zombie maximum health: " + GameModel.zombieHealth;
      case this.types.brainRecoverChance:
        return Math.round(GameModel.brainRecoverChance * 100) + "% chance to recover brain";
      case this.types.riseFromTheDeadChance:
        return Math.round(GameModel.riseFromTheDeadChance * 100) + "% chance for human corpses to turn into zombies";
      case this.types.graveyard:
        return GameModel.graveyard > 0 ? "You have unlocked the Cursed Graveyard" : "You have yet to unlock the Cursed Graveyard";
      case this.types.boneCollectorCapacity:
          return "Bone collector capacity: " + GameModel.boneCollectorCapacity;
    }
  },

  currentRank(upgrade) {
    for (var i = 0; i < GameModel.persistentData.upgrades.length; i++) {
      var ownedUpgrade = GameModel.persistentData.upgrades[i];
      if (upgrade.name == ownedUpgrade.name) {
        return ownedUpgrade.rank;
      }
    }
    return 0;
  },

  upgradePrice(upgrade) {
    return Math.round(upgrade.basePrice * Math.pow(upgrade.multiplier, this.currentRank(upgrade)));
  },

  canAffordUpgrade(upgrade) {
    switch(upgrade.costType) {
      case this.costs.energy:
        return GameModel.energy >= this.upgradePrice(upgrade);
      case this.costs.blood:
        return GameModel.persistentData.blood >= this.upgradePrice(upgrade);
      case this.costs.brains:
        return GameModel.persistentData.brains >= this.upgradePrice(upgrade);
      case this.costs.bones:
        return GameModel.persistentData.bones >= this.upgradePrice(upgrade);
    }
    return false;
  },

  purchaseUpgrade(upgrade) {
    if (this.canAffordUpgrade(upgrade)) {
      switch(upgrade.costType) {
        case this.costs.energy:
          GameModel.energy -= this.upgradePrice(upgrade);
          break;
        case this.costs.blood:
          GameModel.persistentData.blood -= this.upgradePrice(upgrade);
          break;
        case this.costs.brains:
          GameModel.persistentData.brains -= this.upgradePrice(upgrade);
          break;
        case this.costs.bones:
          GameModel.persistentData.bones -= this.upgradePrice(upgrade);
          break;
      }
      var ownedUpgrade;
      for (var i = 0; i < GameModel.persistentData.upgrades.length; i++) {
        if (upgrade.name == GameModel.persistentData.upgrades[i].name) {
          ownedUpgrade = GameModel.persistentData.upgrades[i];
          ownedUpgrade.effect = upgrade.effect;
          ownedUpgrade.rank++;
        }
      }
      if (!ownedUpgrade)
        GameModel.persistentData.upgrades.push({
          name:upgrade.name,
          rank:1,
          type:upgrade.type,
          effect:upgrade.effect
        });
      
      GameModel.saveData();
      this.applyUpgrades();
    }
  },

  Upgrade : function(name, type, costType, basePrice, multiplier, effect, cap, description) {
    this.name = name;
    this.type = type;
    this.costType = costType;
    this.basePrice = basePrice;
    this.multiplier = multiplier;
    this.effect = effect;
    this.cap = cap;
    this.description = description;
    this.rank = 1;
  }
};

Upgrades.upgrades = [
  // blood upgrades
  new Upgrades.Upgrade("Bloodthirst", Upgrades.types.damage, Upgrades.costs.blood, 50, 1.5, 1, 100, "Your zombies thirst for blood and do +1 damage for each rank of Bloodthirst."),
  new Upgrades.Upgrade("Leatherface", Upgrades.types.health, Upgrades.costs.blood, 100, 1.4, 10, 100, "Your zombies gain thicker skin and +10 health with each rank."),
  new Upgrades.Upgrade("Cold Storage", Upgrades.types.brainsCap, Upgrades.costs.blood, 150, 1.2, 50, 100, "Turns out you can use all of your spare blood to store brains and keep them fresh. Each rank increases your maximum brain capacity by 50."),
  new Upgrades.Upgrade("Recycling is Cool", Upgrades.types.brainRecoverChance, Upgrades.costs.blood, 1000, 1.2, 0.1, 10, "Why are we wasting so many good brains on this project? Each rank increases your chance to get a brain back from a dead zombie by 10%"),
  new Upgrades.Upgrade("Your Soul is Mine!", Upgrades.types.riseFromTheDeadChance, Upgrades.costs.blood, 1500, 1.25, 0.1, 10, "Using your most powerful blood magic you command the bodies of the dead to rise as your servants! Each rank grants 10% chance that dead humans will turn into zombies."),
  new Upgrades.Upgrade("Cursed Graveyard", Upgrades.types.graveyard, Upgrades.costs.blood, 2000, 1, 1, 1, "Construct a Cursed Graveyard in the town that will automatically spawn zombies when your energy is at its maximum!"),

  // brain upgrades
  new Upgrades.Upgrade("Energy Rush", Upgrades.types.energyRate, Upgrades.costs.brains, 25, 2, 0.5, 15, "Melting brains down in your cauldron to make smoothies can be beneficial for your health. It also increases your energy rate by 0.5 per second for each rank."),
  new Upgrades.Upgrade("Master Summoner", Upgrades.types.energyCap, Upgrades.costs.brains, 10, 1.5, 5, 100, "All the brains you harvested have proved fruitful in your experiments. Each rank raises your maximum energy by 5."),
  new Upgrades.Upgrade("Primal Reflexes", Upgrades.types.speed, Upgrades.costs.brains, 5, 2, 1, 50, "The zombies retain more of their human agility increasing run speed by 1 for each rank."),
  new Upgrades.Upgrade("Blood Harvest", Upgrades.types.bloodCap, Upgrades.costs.brains, 50, 1.1, 500, 100, "All this brain power has enabled you to devise some superior blood storage vats. Each rank increases your maximum blood by 500."),
  
  // bone upgrades
  new Upgrades.Upgrade("Bone Throne", Upgrades.types.energyCap, Upgrades.costs.bones, 50, 2, 10, 10, "Sitting atop your throne of bones you can finally think clearly. Each rank increases maximum energy by 10."),
  new Upgrades.Upgrade("Crown of Bones", Upgrades.types.energyRate, Upgrades.costs.bones, 200, 1.5, 0.2, 25, "Not just dapper, these spikes help channel your energy. Each rank increases energy rate by 0.2 per second."),
  new Upgrades.Upgrade("Bonebarrows", Upgrades.types.boneCollectorCapacity, Upgrades.costs.bones, 300, 1.5, 5, 20, "Your bone collectors are struggling to carry all these bones. Maybe it's time we gave them an upgrade? Each rank increases their carrying capacity by 5."),
  new Upgrades.Upgrade("Bone Reinforced Blood Tanks", Upgrades.types.bloodCap, Upgrades.costs.bones, 500, 1.1, 2000, 50, "Finally! Now that we have a solid construction material we can get to work building better storage for our other resources. Each rank increases blood storage by 2000."),
  new Upgrades.Upgrade("Brain Cage", Upgrades.types.brainsCap, Upgrades.costs.bones, 650, 1.1, 500, 50, "There's nothing I love more than a mind enslaved. Now we can put these brains where they belong. In cages! Each rank increases brain storage by 200."),
];
