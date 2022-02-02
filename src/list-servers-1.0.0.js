/**
 * @param {NS} ns
 **/
export async function main(ns) {
    const servers = recursiveScan(ns)
    ns.tprintf(`${servers.length} servers found; ${serversWithAdminAccess(ns, servers)} has admin access; ${serversWithBackdoorInstalled(ns, servers)} has backdoor installed`)
}

/**
 * Do a recursive scan of the network to find all servers.
 * 
 * @param {NS} ns
 * @param {string} host
 * @param {string[]} list
 * @param {number} level
 * @return {string[]}
 */
function recursiveScan(ns, host = 'home', list = [], level = 0) {
    // recursive scan to get all servers
    const servers = ns.scan(host)
    for (const server of servers) {
        // if the server is already in the list or is the home server
        // continue to the next server
        if (list.includes(server) || server === 'home') {
            continue
        }
        ns.tprintf(`${'-'.repeat(level * 2)}> ${server}: ${serverInfo(ns, server)}`)
        list.push(server)
        recursiveScan(ns, server, list, level + 1)
    }
    return list
}

/**
 * Extract the relevant information about a server.
 * 
 * @param {NS} ns
 * @param {string} server
 * @return {string}
 */
function serverInfo(ns, server) {
    const { hasAdminRights, backdoorInstalled, numOpenPortsRequired, requiredHackingSkill } = ns.getServer(server)
    return `hasAdminRights=${hasAdminRights}, backdoorInstalled=${backdoorInstalled}, requiredHackingSkill=${requiredHackingSkill}, numOpenPortsRequired=${numOpenPortsRequired}`
}

/**
 * @param {NS} ns
 * @param {string[]} servers
 * @return {number}
 */
function serversWithAdminAccess(ns, servers) {
    function reducer(total, host) {
        const server = ns.getServer(host)
        if (server.hasAdminRights) {
            total = total + 1
        }
        return total
    }
    return servers.reduce(reducer, 0)
}

/**
 * @param {NS} ns
 * @param {string[]} servers
 * @return {number}
 */
function serversWithBackdoorInstalled(ns, servers) {
    function reducer(total, host) {
        const server = ns.getServer(host)
        if (server.backdoorInstalled) {
            total = total + 1
        }
        return total
    }
    return servers.reduce(reducer, 0)
}