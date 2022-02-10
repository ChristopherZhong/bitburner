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
 * @param {boolean} defaultShowLogs
 * @return {[string, string | number | boolean, string | string[]][]}
 */
function getStandardOptions(defaultShowLogs) {
	return [
		['help', false, ['Display this help text.']],
		booleanOption('show-logs', defaultShowLogs, 'Show the %(scriptName)s logs.'),
	]
}

/**
 * @param {[string, string | number | boolean, string | string[]][]} options
 * @param {boolean} defaultShowLogs
 */
export function getOptions(options, defaultShowLogs = false) {
	return [...getStandardOptions(defaultShowLogs), ...options]
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

/**
 * @param {NS} ns
 * @param {string} description
 * @param {[string, string | number | boolean, string | string[]][]} options 
 */
export function printHelp(ns, description, options) {
	const scriptName = ns.getScriptName()
	ns.tprintf('\n')
	ns.tprintf(description)
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