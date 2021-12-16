/**
 * Make money baby!
 * 
 * @param {NS} ns
 */
export async function main(ns) {
	const host = 'n00dles'
	const securityLevelThreshold = ns.getServerMinSecurityLevel(host) + 5
	const moneyThreshold = ns.getServerMaxMoney(host) * 0.75
	while (true) {
		if (ns.getServerSecurityLevel(host) > securityLevelThreshold) {
			await ns.weaken(host)
		}
		else if (ns.getServerMoneyAvailable(host) < moneyThreshold) {
			await ns.grow(host)
		}
		else {
			await ns.hack(host)
		}
	}
}