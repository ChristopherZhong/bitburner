import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'

const crimes = [
    'shoplift', 'rob store', 'mug someone', 'larceny',
    'deal drugs', 'bond forgery', 'traffick illegal arms',
    'homicide', 'grand theft auto',
    'kidnap and ransom', 'assassinate', 'heist'
]

const DEBUG = false

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        let karma = 0
        while (karma < 90) {
            while (peopleKilled(ns) < 30) {
                const crime = bestKillCrime(ns)
                const info = crimeInfo(ns, crime)
                ns.print(`Committing a kill crime: ${crime}, ${JSON.stringify(info)}`)
                await commitCrime(ns, crime)
                // TODO how to determine success
                karma += info.karma
            }
            // TODO select the crime with the highest karma / time
            const crime = 'homicide'
            const info = crimeInfo(ns, crime)
            ns.print(`Committing a crime: ${crime}, ${JSON.stringify(info)}`)
            await commitCrime(ns, crime)
            karma += info.karma
        }
    })
}

/**
 * @param {NS} ns 
 */
function getFlags(ns) {
    const options = getOptions([], true)
    function processFlags(ns, flags) {
        return {}
    }
    function help(ns, options) {
        printHelp(ns, "This script will manage Stanek's Gift.", options)
    }
    return parseFlags(ns, options, processFlags, help)
}

/**
 * @param {NS} ns
 * @return {number}
 */
function peopleKilled(ns) {
    const player = ns.getPlayer()
    return player.numPeopleKilled
}

/**
 * @param {NS} ns
 */
function bestKillCrime(ns) {
    const crimes = filterKillCrimes(ns)
    return bestCrime(ns, crimes, (info) => info.kills)
}

/**
 * @param {NS} ns
 */
function bestKarmaCrime(ns) {
    const crimes = filterKarmaCrimes(ns)
    return bestCrime(ns, crimes, (info) => info.karma)
}

/**
 * @param {NS} ns
 * @param {string[]} crimes
 * @param {() => number} property
 */
function bestCrime(ns, crimes, property) {
    function sort(a, b) {
        function score(info) {
            return property(info) / info.time * info.chance
        }
        const infoA = crimeInfo(ns, a)
        const infoB = crimeInfo(ns, b)
        const scoreA = score(infoA)
        const scoreB = score(infoB)
        return scoreB - scoreA
    }
    crimes.sort(sort)
    if (DEBUG) {
        function forEach(crime) {
            const info = crimeInfo(ns, crime)
            ns.print(`[DEBUG] ${crime}: ${JSON.stringify(info)}`)
        }
        crimes.forEach(forEach)
        ns.print(`[DEBUG] order: ${crimes}`)
    }
    return crimes[0]
}

/**
 * @param {NS} ns
 */
function filterKillCrimes(ns) {
    return filterCrimes(ns, (stats) => stats.kills > 0)
}

/**
 * @param {NS} ns
 */
function filterKarmaCrimes(ns) {
    return filterCrimes(ns, (stats) => stats.karma > 0)
}

/**
 * @param {NS} ns
 * @param {(stats: CrimeStats) => boolean} predicate
 */
function filterCrimes(ns, predicate) {
    function filter(crime) {
        const stats = ns.getCrimeStats(crime)
        return predicate(stats)
    }
    return crimes.filter(filter)
}

/**
 * @param {NS} ns
 * @param {string} crime
 */
function crimeInfo(ns, crime) {
    const { karma, kills, time } = ns.getCrimeStats(crime)
    const chance = ns.getCrimeChance(crime)
    return {
        chance,
        karma,
        kills,
        time
    }
}

/**
 * @param {NS} ns
 * @param {string} crime
 */
async function commitCrime(ns, crime) {
    const time = ns.commitCrime(crime)
    await wait(ns, time)
}

/**
 * @param {NS} ns
 * @param {number} time
 */
async function wait(ns, time) {
    await ns.sleep(time)
    while (ns.isBusy()) {
        await ns.sleep(1000)
    }
}