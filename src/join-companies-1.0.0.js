import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'
import { names } from './utils/companies'

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        for (const name of names) {
            ns.applyToCompany(name, 'business')
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