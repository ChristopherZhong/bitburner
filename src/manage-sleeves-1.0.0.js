import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        // const info = sleeve.getInformation(0)
        // ns.tprint(info)
        // const stats = sleeve.getSleeveStats(number)
        // ns.tprint(stats)
        while (true) {
            manageSleeves(ns, ns.sleeve)
            await ns.sleep(1000)
        }
    })
}

/**
 * @param {NS} ns 
 */
function getFlags(ns) {
    const options = getOptions([])
    function processFlags(ns, flags) {
        return {}
    }
    function help(ns, options) {
        printHelp(ns, "This script will manage Sleeves.", options)
    }
    return parseFlags(ns, options, processFlags, help)
}

/**
 * 
 * @param {NS} ns 
 * @param {Sleeve} sleeve 
 */
function manageSleeves(ns, sleeve) {
    for (let number = 0; number < sleeve.getNumSleeves(); number++) {
        manageSleeve(ns, sleeve, number)
    }
}

/**
 * @param {NS} ns
 * @param {Sleeve} sleeve
 * @param {number} number
 */
function manageSleeve(ns, sleeve, number) {
    const purchaseable = sleeve.getSleevePurchasableAugs(number)
    for (const augmentation of purchaseable) {
        if (sleeve.purchaseSleeveAug(number, augmentation.name)) {
            ns.print(`Sleeve ${number}: Purchased ${augmentation.name} at ${augmentation.cost}`)
        } else {
            ns.print(`Sleeve ${number}: Failed to purchase ${augmentation.name} at ${augmentation.cost}`)
        }
    }
    const stats = sleeve.getSleeveStats(number)
    // ns.print(stats)
    if (stats.shock > number) {
        if (sleeve.setToShockRecovery(number)) {
            ns.print(`Sleeve ${number}: Set task to shock recovery`)
        } else {
            ns.print(`Sleeve ${number}: Failed to set task to shock recovery`)
        }
    } else if (stats.sync < 100) {
        if (sleeve.setToSynchronize(number)) {
            ns.print(`Sleeve ${number}: Set task to synchronize`)
        } else {
            ns.print(`Sleeve ${number}: Failed to set task to synchronize`)
        }
    } else {
        const task = sleeve.getTask(number)
        if (isIdle(task)) {
            const name = 'Heist'
            if (sleeve.setToCommitCrime(number, name)) {
                ns.print(`Sleeve ${number}: Set task to ${name}`)
            } else {
                ns.print(`Sleeve ${number}: Failed to set task to ${name}`)
            }
        } else {
            // ns.print(task)
            ns.print(`Sleeve ${number}: Task is ${taskString(task)}`)
        }
    }
}

/**
 * @param {SleeveTask} task
 */
function isIdle(task) {
    return task.task === 'Idle'
}

/**
 * @param {SleeveTask} task
 */
function taskString(task) {
    let result = task.task
    if (task.task === 'Class') {
        result += ` ${task.location}`
    }
    if (task.task === 'Company') {
        result += ` ${task.location}`
    }
    if (task.task === 'Crime') {
        result += ` ${task.crime}`
    }
    if (task.task === 'Faction') {
        result += ` ${task.location} ${task.factionWorkType}`
    }
    if (task.task === 'Gym') {
        result += ` ${task.location} ${task.gymStatType}`
    }
    return result
}