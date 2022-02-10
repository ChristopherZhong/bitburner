import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'
import { cityFactions } from './utils/factions'

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        while (true) {
            const invitations = ns.checkFactionInvitations()
            for (const invite of invitations) {
                if (cityFactions.includes(invite)) {
                    continue
                }
                ns.joinFaction(invite)
            }
            await ns.sleep(1000);
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
        printHelp(ns, "This script will automatically join non-city Factions.", options)
    }
    return parseFlags(ns, options, processFlags, help)
}