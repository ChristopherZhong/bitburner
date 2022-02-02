const options = [
    ['help', false, ['Display this help text.']],
    ['buy', false, [
        'Repeat buying the NeuroFlux Governor.',
        'USAGE: run %(scriptName)s --%(option)s',
        'Example:',
        '> run %(scriptName)s --%(option)s',
    ]],
]

/** @param {NS} ns **/
export async function main(ns) {
    const flags = ns.flags(options)
    ns.tail()
    // ns.installAugmentations()
    while (true) {
        const factions = joinedFactions(ns)
        // ns.print(`${factions}`)
        for (const faction of factions) {
            // ns.tprintf(`faction=${faction}`)
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
        if (flags.buy) {
            const fac = 'Sector-12'
            const aug = 'NeuroFlux Governor'
            for (let i = 0; i < 100; i++) {
                const b = ns.purchaseAugmentation(fac, aug)
                // ns.tprintf(`purchase=${b}`)
            }
            // ns.tprintf(`stats=${JSON.stringify(ns.getAugmentationStats(aug), undefined, 2)}`)
        }
        // const augmentation = augmentations[0]
        // ns.tprintf(`aug=${augmentation}`)
        // const pre = ns.getAugmentationPrereq(augmentation)
        // ns.tprintf(`pre=${pre}`)
        // const price = ns.getAugmentationPrice(augmentation)
        // ns.tprintf(`price=${price}`)
        // const rep = ns.getAugmentationRepReq(augmentation)
        // ns.tprintf(`rep=${rep}`)
        // const stats = ns.getAugmentationStats(augmentation)
        // ns.tprintf(`stats=${JSON.stringify(stats, undefined, 2)}`)
        // const b = ns.purchaseAugmentation(faction, augmentation)
        // ns.tprintf(`purchaces=${b}`)
        await ns.sleep(1000)
    }
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