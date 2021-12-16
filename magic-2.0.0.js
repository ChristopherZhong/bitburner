/** 
 * Deploy a script to a server and execute it with `n` threads,
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

	// TODO check server for root access
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