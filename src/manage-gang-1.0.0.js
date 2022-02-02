import { booleanOption, getOptions, parseFlags } from './utils/flags'

/**
 * @param {NS} ns
 **/
export async function main(ns) {
	const flags = getFlags(ns)
	if (flags) {
		ns.tprint(`flags: ${JSON.stringify(flags)}`)
		if (flags.showLogs) {
			ns.tail()
		}
		ns.disableLog('sleep')
		while (true) {
			manageGang(ns, ns.gang, flags)
			await ns.sleep(1000)
		}
	}
}

/**
 * @param {NS} ns
 */
function getFlags(ns) {
	const options = getOptions([
		booleanOption('print-member-info', false, 'Show the %(scriptName)s logs.'),
		booleanOption('log-ascension-result', false, 'Log the result of ascension.'),
	])
	function processFlags(ns, flags) {
		return {
			printMemberInfo: flags['print-member-info'],
			logAscensionResult: flags['log-ascension-result'],
		}
	}
	function printHelp(ns, options) {
		const scriptName = ns.getScriptName()
		ns.tprintf('\n')
		ns.tprintf('This script will manage a gang.')
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
 * @param {Gang} gang
 * @param {{ printMemberInfo: boolean }} flags
 */
function manageGang(ns, gang, flags) {
	if (gang.inGang()) {
		// ns.print('in gang')
		// const gangInfo = gang.getGangInformation()
		// ns.print(`gang: ${JSON.stringify(gangInfo)}`)
		recruitMember(ns, gang)
		const names = gang.getMemberNames()
		for (const name of names) {
			printMemberInfo(ns, gang, name, flags)
			ascendMember(ns, gang, name, flags)
			purchaseEquipment(ns, gang, name, flags)
		}
	} else {
		ns.print('not in gang')
		const faction = ''
		gang.createGang(faction)
	}

}

/**
 * @param {NS} ns
 * @param {Gang} gang
 */
function recruitMember(ns, gang) {
	while (gang.canRecruitMember()) {
		const names = gang.getMemberNames()
		let index = 1
		let name = `G${index}`
		while (names.includes(name)) {
			name = `G${index++}`
		}
		if (gang.recruitMember(name)) {
			ns.print(`Successfully recruited a gang member: ${name}`)
		} else {
			ns.print(`Failed to recruit a gang member: ${name}`)
		}
	}
}

/**
 * @param {NS} ns
 * @param {Gang} gang
 * @param {string} name
 * @param {{ printMemberInfo: boolean }} flags
 */
function printMemberInfo(ns, gang, name, flags) {
	if (flags.printMemberInfo) {
		const info = gang.getMemberInformation(name)
		ns.print(`Gang member: ${info.name} (task=${info.task})`)
	}
}

/**
 * @param {NS} ns
 * @param {Gang} gang
 * @param {string} name
 * @param {{ logAscensionResult: boolean }} flags
 */
function ascendMember(ns, gang, name, flags) {
	const result = gang.getAscensionResult(name)
	const keys = ['agi', 'cha', 'def', 'dex', 'hack']
	const min = 1.1
	if (result && keys.reduce((previous, key) => previous && result[key] > min, true)) {
		const info = gang.ascendMember(name)
		if (info) {
			ns.print(`Successfully ascended a gang member: ${name}`)
		} else {
			ns.print(`Failed to ascend a gang member: ${name}`)
		}
	} else if (flags.logAscensionResult) {
		const texts = []
		if (result) {
			for (const key of keys) {
				const value = result[key]
				const text = `${key}=${value > min} (${value})`
				texts.push(text)
			}
		}
		ns.print(`Unable to ascend a gang member: ${name}`)
		for (const text of texts) {
			ns.print(`- ${text}`)
		}
	}
}

/**
 * @param {NS} ns
 * @param {Gang} gang
 * @param {string} name
 * @param {} flags
 */
function purchaseEquipment(ns, gang, name, flags) {
	const equipments = gang.getEquipmentNames()
	for (const equipment of equipments) {
		const { augmentations, upgrades } = gang.getMemberInformation(name)
		if (!augmentations.includes(equipment) && !upgrades.includes(equipment)) {
			gang.purchaseEquipment(name, equipment)
		}
	}

}