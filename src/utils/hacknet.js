export class HacknetNode {
    // name
    // level
    // ram
    // cores
    // levelUpgradeCost
    // ramUpgradeCost
    // coreUpgradeCost

    /**
     * @param {number} index
     * @param {string} name
     * @param {number} level
     * @param {number} ram
     * @param {number} cores
     * @param {number} production
     * @param {number} levelUpgradeCost
     * @param {number} ramUpgradeCost
     * @param {number} coreUpgradeCost
     */
    constructor(
        index,
        name,
        level,
        ram,
        cores,
        production,
        levelUpgradeCost,
        ramUpgradeCost,
        coreUpgradeCost
    ) {
        this.index = index
        this.name = name
        this.level = level
        this.ram = ram
        this.cores = cores
        this.production = production
        this.levelUpgradeCost = levelUpgradeCost
        this.ramUpgradeCost = ramUpgradeCost
        this.coreUpgradeCost = coreUpgradeCost
    }

    /**
     * Update the data about a Hacknet Node.
     *
     * @param {Hacknet} hacknet
     */
    update(hacknet) {
        const stats = hacknet.getNodeStats(this.index)
        this.level = stats.level
        this.ram = stats.ram
        this.cores = stats.cores
        this.production = stats.production
        this.levelUpgradeCost = hacknet.getLevelUpgradeCost(this.index)
        this.ramUpgradeCost = hacknet.getRamUpgradeCost(this.index)
        this.coreUpgradeCost = hacknet.getCoreUpgradeCost(this.index)

    }

    /**
     * @return {boolean}
     */
    isMax() {
        return this.levelUpgradeCost == undefined
            && this.ramUpgradeCost == undefined
            && this.coreUpgradeCost == undefined
    }

    /**
     * @return {}
     */
    cheapestComponent() {
        if (this.levelUpgradeCost < this.ramUpgradeCost && this.levelUpgradeCost < this.coreUpgradeCost) {
            return UpgradeLevel
        }
        if (this.ramUpgradeCost < this.levelUpgradeCost && this.ramUpgradeCost < this.coreUpgradeCost) {
            return UpgradeRam
        }
        return UpgradeCore
    }

}

export class HacknetServer extends HacknetNode {

}