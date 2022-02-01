import { parseFlags, standardOptions } from 'flag'
import { scan } from 'server'

const options = [
	['help', false, ['Display this help text.']],
	['host', undefined, [
		'The server to hack.',
		'USAGE: run %(scriptName)s --%(option)s <server>',
		'Example:',
		'> run %(scriptName)s --%(option)s n00dles',
	]],
	['money', 0.75, [
		'The threshold before the script runs grow.',
		'Default: %(value)s',
		'USAGE: run %(scriptName)s --%(option)s <threshold>',
		'Example:',
		'> run %(scriptName)s --%(option)s %(value)s',
	]],
	['security', 5, [
		'The threshold before the script runs weaken.',
		'Default: %(value)s',
		'USAGE: run %(scriptName)s --%(option)s <threshold>',
		'Example:',
		'> run %(scriptName)s --%(option)s %(value)s',
	]],
]

/** 
 * Deploy a script to a list of servers, gain root access to the server, and
 * execute it with `n` threads, where `n` is the maximum number of threads that
 * the script can run on the server.
 * 
 * Arguments:
 * 1 - script file
 * 
 * @param {NS} ns
 **/
export async function main(ns) {
	const flags = parseFlags(ns, standardOptions, (ns, flags) => { return { file: flags._[0], showLogs: flags['show-logs'] } }, () => { })
	// ns.tprintf(`flags=${JSON.stringify(flags)}`)
	if (!flags) {
		return
	}
	const file = flags.file
	// TODO check if file exists
	const currentHost = ns.getHostname()

	const servers = scan(ns)
	// ns.tprintf(`servers=${servers}`)
	if (flags.showLogs) {
		ns.tail()
	}
	while (hasUnhackedServers(ns, servers)) {
		// monitor unhacked servers and keep retrying to hack them
		for (const targetHost of servers) {
			ns.print(`${targetHost}: ${new Date()}`)
			// TODO skip darkweb server
			// TODO purchased servers should hack other servers, not itself
			const isServerHacked = await hackServer(ns, file, currentHost, targetHost)
		}
		await ns.sleep(1000)
	}
}

/**
 * Do a recursive scan of the network to find all servers.
 * 
 * @param {NS} ns
 * @param {string} host
 * @param {string[]} list
 */
function recursiveScan(ns, host, list) {
	// recursive scan to get all servers
	const servers = ns.scan(host, true)
	for (const server of servers) {
		// if the server is already in the list or is the home server
		// continue to the next server
		if (list.includes(server) || server === 'home') {
			continue
		}
		list.push(server)
		recursiveScan(ns, server, list)
	}
}

/**
 * Check if there is any server that is not yet hacked.
 * 
 * @param {NS} ns
 * @param {string[]} servers
 * @return {boolean}
 */
function hasUnhackedServers(ns, servers) {
	for (const host of servers) {
		const server = ns.getServer(host)
		if (!server.hasAdminRights) {
			return true
		}
	}
	return false
}

/**
 * Deploy a script to a server, gain root access to the server, and execute it with `n` threads,
 * where `n` is the maximum number of threads that can run the script on the server.
 * 
 * @param {NS} ns
 * @param {string} file
 * @param {string} currentHost
 * @param {string} targetHost
 * @returns {Promise<boolean>} `true` if the script was deployed, `false` otherwise.
 */
async function hackServer(ns, file, currentHost, targetHost) {
	// TODO check if server exists

	// copy file to server
	// TODO check if file exists on server
	await ns.scp(file, currentHost, targetHost)

	const hasRootAccess = obtainRootAccess(ns, targetHost)
	if (!hasRootAccess) {
		return false
	}

	// TODO install backdoor (if have Source-File 4-1)
	// ns.installBackdoor()

	// TODO check if script is already running, maybe restart it?
	if (ns.scriptRunning(file, targetHost)) {
		ns.print(`[${targetHost}]: '${file}' already running`)
		return true
	}
	const threads = computeThreads(ns, targetHost, file)
	// ensure that at least 1 thread of the script can run
	if (threads < 1) {
		ns.print(`[${targetHost}]: Not enough memory`)
		return false
	}
	const pid = ns.exec(file, targetHost, threads, targetHost)
	return pid === 0
}

/**
 * Compute the maximum number of threads to run the script on the server.
 * 
 * @param {NS} ns
 * @param {string} host
 * @param {string} script
 * @returns {number}
 */
function computeThreads(ns, host, script) {
	// compute the maximum number of threads that can run the file on the server
	const freeRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
	const scriptRam = ns.getScriptRam(script)
	return Math.floor(freeRam / scriptRam)
}

/**
 * Attempt to gain root access to a server.
 * 
 * @param {NS} ns
 * @param {string} host
 * @return {boolean} `true` if root access was obtained, `false` otherwise.
 */
function obtainRootAccess(ns, host) {
	// check server for root access

	// there is nothing to do if root access to the server is already obtained
	if (ns.hasRootAccess(host)) {
		ns.print(`[${host}]: Already have root access`)
		return true
	}
	ns.print(`[${host}]: Gaining root access`)

	// check hacking level
	const hackingLevel = ns.getHackingLevel()
	const serverRequiredHackingLevel = ns.getServerRequiredHackingLevel(host)
	if (hackingLevel < serverRequiredHackingLevel) {
		ns.print(`[${host}]: Low hacking level: required=${serverRequiredHackingLevel}, current=${hackingLevel}`)
		return false
	}

	// prepare a list of available exploits
	const exploits = prepareExploits(ns)

	// check open ports requirement
	const serverNumPortsRequired = ns.getServerNumPortsRequired(host)
	if (exploits.length < serverNumPortsRequired) {
		ns.print(`[${host}]: Not enough exploits: need=${serverNumPortsRequired}, current=${exploits.length}`)
		return false
	}

	// execute the necessary amount of exploits to gain root access
	for (let i = 0; i < Math.min(serverNumPortsRequired, exploits.length); i++) {
		const { file, f } = exploits[i]
		f(host)
	}

	// gain root access to the server
	ns.nuke(host)
	return true
}

/**
 * Get a list of available exploits.
 * 
 * @param {NS} ns
 * @return {Array<{ file: string; f: (host: string) => void; }>} the list of available exploits.
 */
function prepareExploits(ns) {
	const list = [
		{ file: 'BruteSSH.exe', f: ns.brutessh },
		{ file: 'FTPCrack.exe', f: ns.ftpcrack },
		{ file: 'relaySMTP.exe', f: ns.relaysmtp },
		{ file: 'HTTPWorm.exe', f: ns.httpworm },
		{ file: 'SQLInject.exe', f: ns.sqlinject },
	]
	const host = ns.getHostname()
	return list.filter(({ file }) => ns.fileExists(file, host))
}