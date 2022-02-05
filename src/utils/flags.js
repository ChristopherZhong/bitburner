/**
 * @param {string} optionName
 * @param {boolean} defaultValue
 * @param {string} description
 * @return {[string, boolean, string[]]}
 */
export function booleanOption(optionName, defaultValue, description) {
	const descriptions = [
		description,
	]
	if (defaultValue != undefined) {
		descriptions.push(`If unspecified, default to ${defaultValue}.`)
	}
	descriptions.push(
		'USAGE: run %(scriptName)s --%(option)s',
		'Example:',
		'> run %(scriptName)s --%(option)s',
	)
	return [optionName, defaultValue, descriptions]
}

/**
 * @return {[string, string | number | boolean, string | string[]][]}
 */
function getStandardOptions() {
	return [
		['help', false, ['Display this help text.']],
		booleanOption('show-logs', false, 'Show the %(scriptName)s logs.'),
	]
}

/**
 * @param {[string, string | number | boolean, string | string[]][]} options
 */
export function getOptions(options) {
	return [...getStandardOptions(), ...options]
}

/**
 * @param {NS} ns
 * @param {[string, string | number | boolean, string | string[]][]} options
 * @param {(ns: NS, flags: any) => any} processFlags
 * @param {(ns: NS) => void} printHelp
 */
export function parseFlags(ns, options, processFlags, printHelp) {
	const flags = ns.flags(options)
	if (flags.help) {
		printHelp(ns, options)
		return
	}
	const showLogs = flags['show-logs']
	return {
		showLogs,
		...processFlags(ns, flags),
	}
}

/**
 * @param {NS} ns
 * @param {(ns: NS) => any} getFlags
 * @param {(flags: any) => Promise<void>} run
 */
export async function useFlags(ns, getFlags, run) {
	const flags = getFlags(ns)
	if (flags) {
		ns.tprint(`flags: ${JSON.stringify(flags)}`)
		if (flags.showLogs) {
			ns.tail()
		}
		ns.disableLog('sleep')
		await run(flags)
	}
}