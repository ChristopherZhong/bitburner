import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'

/** @param {NS} ns **/
export async function main(ns) {
    await useFlags(ns, getFlags, async (flags) => {
        while (true) {
            const factions = joinedFactions(ns)
            // ns.print(`${factions}`)
            for (const faction of factions) {
                // ns.print(`faction=${faction}`)
                const purchasable = purchasableAugmentations(ns, faction)
                for (const augmentation of purchasable) {
                    ns.print(`${faction}: buying ${augmentation}`)
                    const purchased = ns.purchaseAugmentation(faction, augmentation)
                    if (purchased) {
                        ns.print(`Successfully bought ${augmentation} from ${faction}`)
                    } else {
                        ns.print(`Failed to buy ${augmentation} from ${faction}`)
                    }
                }
            }
            if (flags.buyNeuroFluxGoverner) {
                const augmentation = 'NeuroFlux Governor'
                const factionsWith = factions.filter((faction) => ns.getAugmentationsFromFaction(faction).includes(augmentation))
                const faction = factionsWith[0]
                for (let i = 0; i < 100; i++) {
                    const b = ns.purchaseAugmentation(faction, augmentation)
                    // ns.tprintf(`purchase=${b}`)
                }
                // ns.tprintf(`stats=${JSON.stringify(ns.getAugmentationStats(aug), undefined, 2)}`)
            }
            await ns.sleep(1000)
        }

    })
}

/**
 * @param {NS} ns 
 */
function getFlags(ns) {
    const options = getOptions([
        booleanOption('buy-neuroflux-governor', false, 'Repeat buying the NeuroFlux Governor.'),
    ])
    function processFlags(ns, flags) {
        return {
            buyNeuroFluxGovernor: flags['buy-neuroflux-governor'],
        }
    }
    function help(ns, options) {
        printHelp(ns, 'This script will manage a bladeburner.', options)
    }
    return parseFlags(ns, options, processFlags, help)
}

/**
 * @param {NS} ns
 */
function joinedFactions(ns) {
    const player = ns.getPlayer()
    return player.factions
}

/**
 * @param {NS} ns
 * @param {string} faction
 */
function purchasableAugmentations(ns, faction) {
    const purchased = ns.getOwnedAugmentations(true)
    const factionAugmentations = ns.getAugmentationsFromFaction(faction)
    function filter(augmentation) {
        return !purchased.includes(augmentation)
    }
    const purchasable = factionAugmentations.filter(filter)
    return purchasable
}