/** 
 * Deploy a script to a server, gain root access to the server, and execute it with `n` threads,
 * where `n` is the maximum number of threads that can run the script on the server.
 * 
 * Arguments:
 * 1 - script file
 * 2 - server hostname
 * 
 * @param {NS} ns
 **/
export async function main(ns) {
	const file = ns.args[0]
	// TODO check if file exists
	const currentHost = ns.getHostname()
	const targetHost = ns.args[1]
	// TODO check if server exists

	// copy file to server
	// TODO check if file exists on server
	await ns.scp(file, currentHost, targetHost)

	if (!obtainRootAccess(ns, targetHost)) {
		ns.tail()
		return
	}

	const threads = computeThreads(ns, targetHost, file)
	const pid = ns.exec(file, targetHost, threads, targetHost)
	if (pid === 0) {
		ns.tail()
	}
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
		ns.print(`Already have root access to the "${host}" server.`)
		return true
	}
	ns.print(`Attempting to gain root access to the "${host}" server.`)

	// check hacking level
	const hackingLevel = ns.getHackingLevel()
	const serverRequiredHackingLevel = ns.getServerRequiredHackingLevel(host)
	if (hackingLevel < serverRequiredHackingLevel) {
		ns.print(`. Failed! The required hacking level (${serverRequiredHackingLevel}) of the "${host}" server is higher than your hacking level (${hackingLevel})!`)
		return false
	}

	// prepare a list of available exploits
	const exploits = prepareExploits(ns)

	// check open ports requirement
	const serverNumPortsRequired = ns.getServerNumPortsRequired(host)
	if (exploits.length < serverNumPortsRequired) {
		ns.print(`. Failed! Not enough available exploits (${exploits.length}) to gain root access to the "${host}" server (${serverNumPortsRequired})!`)
		return false
	}

	// execute the necessary amount of exploits to gain root access
	for (let i = 0; i < Math.min(serverNumPortsRequired, exploits.length); i++) {
		const { file, f } = exploits[i]
		ns.print(`. Running the "${file}" exploit.`)
		f(host)
	}

	// gain root access to the server
	ns.print(`. Nuking the "${host}" server.`)
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
