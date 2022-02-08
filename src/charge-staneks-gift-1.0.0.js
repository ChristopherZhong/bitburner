import { booleanOption, getOptions, parseFlags, printHelp, useFlags } from './utils/flags'

/** @param {NS} ns **/
export async function main(ns) {
	await useFlags(ns, getFlags, async (flags) => {
		// ns.tprint(ns.stanek.activeFragments()[0])
		while (true) {
			await charge(ns, ns.stanek)
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
		printHelp(ns, "This script will manage Stanek's Gift.", options)
	}
	return parseFlags(ns, options, processFlags, help)
}

/**
 * @param {NS} ns
 * @param {Stanek} stanek
 */
async function charge(ns, stanek) {
	const fragments = stanek.activeFragments()
	if (fragments.length > 0) {
		for (const fragment of fragments) {
			ns.print(`id=${fragment.id}, x=${fragment.x}, y=${fragment.y}, avgCharge=${fragment.avgCharge}, numCharge=${fragment.numCharge}`)
			await stanek.charge(fragment.x, fragment.y)
		}
	} else {
		ns.print(`[${new Date()}] No fragments to charge`)
		await ns.sleep(1000)
	}
}