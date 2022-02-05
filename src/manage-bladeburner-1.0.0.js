import { booleanOption, getOptions, parseFlags, useFlags } from './utils/flags'

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        ns.tprint(`general=${ns.bladeburner.getGeneralActionNames()}`)
        ns.tprint(`contract=${ns.bladeburner.getContractNames()}`)
        ns.tprint(`operation=${ns.bladeburner.getOperationNames()}`)
        ns.tprint(`blackop=${ns.bladeburner.getBlackOpNames()}`)
        ns.tprint(`${ns.bladeburner.getActionCountRemaining('general', 'diplomacy')}`)
        ns.tprint(`${ns.bladeburner.getActionCountRemaining('operation', 'Raid')}`)
        ns.tprint(`skill=${ns.bladeburner.getSkillNames()}`)
        while (true) {
            await manageBladeburner(ns, ns.bladeburner, flags)
            await ns.sleep(1000)
        }
    })
}

/**
 * @param {NS} ns
 */
function getFlags(ns) {
    const options = getOptions([
        // booleanOption('print-member-info', false, 'Show the %(scriptName)s logs.'),
        // booleanOption('log-ascension-result', false, 'Log the result of ascension.'),
    ])
    function processFlags(ns, flags) {
        return {
            // printMemberInfo: flags['print-member-info'],
            // logAscensionResult: flags['log-ascension-result'],
        }
    }
    function printHelp(ns, options) {
        const scriptName = ns.getScriptName()
        ns.tprintf('\n')
        ns.tprintf('This script will manage a bladeburner.')
        const length = options.reduce((previous, [optionName]) => {
            const length = optionName.length
            return previous > length ? previous : length
        }, 0) + 2
        const filler = ' '.repeat(length + 2)
        for (const [option, value, text] of options) {
            ns.tprintf(`--%(option)-${length}s${text.join(`\n${filler}`)}`, { option, scriptName, value })
        }
        ns.tprintf('\n')
        ns.tprintf(`USAGE: run ${scriptName}`)
        ns.tprintf("Example:")
        ns.tprintf(`> run ${scriptName}`)
    }
    return parseFlags(ns, options, processFlags, printHelp)
}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 * @param flags
 */
async function manageBladeburner(ns, bladeburner, flags) {
    checkAndSwitchCity(ns, bladeburner)
    await diplomacy(ns, bladeburner)
    await communityAction(ns, bladeburner)
    await populationAction(ns, bladeburner)
}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 */
function checkAndSwitchCity(ns, bladeburner) {
    function checkCity(city) {
        const chaos = bladeburner.getCityChaos(city)
        const communities = bladeburner.getCityCommunities(city)
        const population = bladeburner.getCityEstimatedPopulation(city)
        return chaos === 0 && communities === 0 && population === 0
    }
    // if pop = 0, communities = 0 and chaos = 0, then move to next city
    if (checkCity(bladeburner.getCity())) {
        let cities = []
        // find the next city
        for (const city of cities) {
            if (checkCity(city)) {
                continue
            } else {
                bladeburner.switchCity(city)
                break
            }
        }
    }

}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 */
async function diplomacy(ns, bladeburner) {
    const city = bladeburner.getCity()
    const chaos = bladeburner.getCityChaos(city)
    // if chaos > 0, then diplomacy
    if (chaos > 0) {
        const actionType = 'General'
        const actionName = 'Diplomacy'
        await startAction(ns, bladeburner, actionType, actionName)
    }
}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 */
async function communityAction(ns, bladeburner) {
    const city = bladeburner.getCity()
    const communities = bladeburner.getCityCommunities(city)
    // if communities > 0 then raid
    if (communities > 0) {
        const actionType = 'Operation'
        const actionName = 'Raid'
        await startAction(ns, bladeburner, actionType, actionName)
    }
}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 */
async function populationAction(ns, bladeburner) {
    const city = bladeburner.getCity()
    const population = bladeburner.getCityEstimatedPopulation(city)
    // if pop > 0 then Stealth Retirement Operation, Sting Operation
    if (population > 0) {
        const actionType = 'Operation'
        const actionName = 'Stealth Retirement Operation'
        await startAction(ns, bladeburner, actionType, actionName)
    }
}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 * @param {string} actionType
 * @param {string} actionName
 */
async function startAction(ns, bladeburner, actionType, actionName) {
    if (bladeburner.startAction(actionType, actionName)) {
        const time = bladeburner.getActionTime(actionType, actionName)
        await waitUntilIdle(ns, bladeburner, time)
    }

}

/**
 * @param {NS} ns
 * @param {Bladeburner} bladeburner
 * @param {number} time
 */
async function waitUntilIdle(ns, bladeburner, time) {
    await ns.sleep(time)
    while (bladeburner.getCurrentAction().type !== 'Idle') {
        await ns.sleep(1000)
    }
}