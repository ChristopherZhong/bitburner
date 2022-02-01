/** 
 * Deploy a script to a server and execute it with a number of threads.
 * 
 * Arguments:
 * 1 - script file
 * 2 - server hostname
 * 3 - number of threads
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
	// TODO compute the maximum number of threads that can run the file on the server
	const threads = ns.args[2]
	const pid = ns.exec(file, targetHost, threads, targetHost)
	if (pid === 0) {
		ns.tail()
	}
}