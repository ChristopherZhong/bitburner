const UpgradeLevel = 0
const UpgradeRam = 1
const UpgradeCore = 2

class HacknetNode {
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

/**
 * @param {NS} ns 
 **/
export async function main(ns) {
    ns.tail()
    const hacknet = ns.hacknet
    const nodes = getHacknetNodes(hacknet)
    const debug = {
        purchaseNodeCost: hacknet.getPurchaseNodeCost(),
        nodes: nodes,
    }
    ns.print(`${JSON.stringify(debug)}`)
    // infinite loop
    while (true) {
        const purchaseNodeCost = hacknet.getPurchaseNodeCost()
        const cheapestNode = findCheapestNode(purchaseNodeCost, nodes)
        if (cheapestNode === undefined) {
            await buyHacknetNode(ns, nodes)
        } else {
            await upgradeHacknetNode(ns, cheapestNode, nodes)
        }
    }
}

/**
 * Buy a Hacknet Node.
 * 
 * @param {NS} ns
 * @param {HacknetNode[]} nodes
 */
async function buyHacknetNode(ns, nodes) {
    // buy a hacknet node
    const hacknet = ns.hacknet
    const purchaseNodeCost = hacknet.getPurchaseNodeCost()
    await sleepUntilEnoughMoneyAvailable(ns, purchaseNodeCost)
    const index = hacknet.purchaseNode()
    const node = newHacknetNode(hacknet, index)
    ns.print(`Bought a new Hacknet node: ${JSON.stringify(node)}`)
    nodes.push(node)
}

/**
 * Upgrade a Hacknet Node.
 * 
 * @param {NS} ns
 * @param {} cheapestNode
 * @param {HacknetNode[]} nodes
 */
async function upgradeHacknetNode(ns, cheapestNode, nodes) {
    // upgrade a hacknet node
    const hacknet = ns.hacknet
    // ns.print(`cheapest[before]=${JSON.stringify(cheapestNode, null, 2)}`)
    // TODO buy more than one based on money
    const node = cheapestNode.node
    const index = node.index
    if (cheapestNode.action === UpgradeLevel) {
        // upgrade node level
        await sleepUntilEnoughMoneyAvailable(ns, node.levelUpgradeCost)
        const status = hacknet.upgradeLevel(index)
        node.update(hacknet)
        ns.print(`Upgraded node level: node: ${index}, status: ${status}`)
    } else if (cheapestNode.action === UpgradeRam) {
        // upgrade node ram
        await sleepUntilEnoughMoneyAvailable(ns, node.ramUpgradeCost)
        const status = hacknet.upgradeRam(index)
        node.update(hacknet)
        ns.print(`Upgraded node ram: node: ${index}, status: ${status}`)
    } else {
        // upgrade node core
        await sleepUntilEnoughMoneyAvailable(ns, node.coreUpgradeCost)
        const status = hacknet.upgradeCore(index)
        node.update(hacknet)
        ns.print(`Upgraded node core: node: ${index}, status: ${status}`)
    }
    // ns.print(`cheapest[after]=${JSON.stringify(cheapestNode, null, 2)}`)
}

/**
 * Sleep until the player's available money is equal to or greater than the specified amount.
 * 
 * @param {NS} ns
 * @param {number} amount
 */
async function sleepUntilEnoughMoneyAvailable(ns, amount) {
    while (ns.getServerMoneyAvailable('home') < amount) {
        // TODO calculate a sleep time based on difference
        await ns.sleep(1000)
    }
}

/**
 * Find the node with the component that is the cheapest to upgrade.
 * 
 * @param {number} buyCost
 * @param {HacknetNode[]} nodes
 * @return {{ index: number; action: UpgradeLevel | UpgradeRam | UpgradeCore }}
 */
function findCheapestNode(buyCost, nodes) {
    let cheapestNode = undefined
    nodes.forEach((node, index) => {
        if (cheapestNode === undefined) {
            if (node.levelUpgradeCost < node.ramUpgradeCost
                && node.levelUpgradeCost < node.coreUpgradeCost
                && node.levelUpgradeCost < buyCost) {
                cheapestNode = { action: UpgradeLevel, node, cost: node.levelUpgradeCost }
            } else if (node.ramUpgradeCost < node.levelUpgradeCost
                && node.ramUpgradeCost < node.coreUpgradeCost
                && node.ramUpgradeCost < buyCost) {
                cheapestNode = { action: UpgradeRam, node, cost: node.ramUpgradeCost }
            } else if (node.coreUpgradeCost < buyCost) {
                cheapestNode = { action: UpgradeCore, node, cost: node.coreUpgradeCost }
            }
        } else {
            if (node.levelUpgradeCost < cheapestNode.cost) {
                cheapestNode = { action: UpgradeLevel, node, cost: node.levelUpgradeCost }
            } else if (node.ramUpgradeCost < cheapestNode.cost) {
                cheapestNode = { action: UpgradeRam, node, cost: node.ramUpgradeCost }
            } else if (node.coreUpgradeCost < cheapestNode.cost) {
                cheapestNode = { action: UpgradeCore, node, cost: node.coreUpgradeCost }
            }
        }
    })
    return cheapestNode
}

/**
 * Returns a list of HacknetNodes.
 * 
 * @param {Hacknet} hacknet
 * @return {HacknetNode[]}
 */
function getHacknetNodes(hacknet) {
    return [...Array(hacknet.numNodes())].map((_, index) => newHacknetNode(hacknet, index))
}

/**
 * Returns a HacknetNode.
 * 
 * @param {Hacknet} hacknet
 * @param {number} index
 * @return {HacknetNode}
 */
function newHacknetNode(hacknet, index) {
    const stats = hacknet.getNodeStats(index)
    return new HacknetNode(
        index,
        stats.name,
        stats.level,
        stats.ram,
        stats.cores,
        stats.production,
        hacknet.getLevelUpgradeCost(index),
        hacknet.getRamUpgradeCost(index),
        hacknet.getCoreUpgradeCost(index),
    )
}