/** 
 * Drain a server of its money.
 * 
 * @param {NS} ns
 **/
export async function main(ns) {
    const flags = parseFlags(ns)
    if (!flags) {
        return
    }
    const { host, securityThreshold } = flags
    while (ns.getServerMoneyAvailable(host) > 0) {
        if (ns.getServerSecurityLevel(host) > securityThreshold) {
            await ns.weaken(host)
        } else {
            await ns.hack(host)
        }
    }
}

const options = [
    ['help', false, ['Display this help text.']],
    ['host', undefined, [
        'The server to hack.',
        'USAGE: run %(scriptName)s --%(option)s <server>',
        'Example:',
        '> run %(scriptName)s --%(option)s n00dles',
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
* Parse the CLI flags.
* 
* @param {NS} ns
* @returns {{ host: string; security: number; money: number }}
*/
function parseFlags(ns) {
    const flags = ns.flags(options)
    // ns.tprint(`flags=${JSON.stringify(flags)}`)
    if (flags.help) {
        printHelp(ns)
        return
    }
    const host = flags.host || flags._[0]
    if (!host) {
        printHelp(ns)
        return
    }
    const securityThreshold = ns.getServerMinSecurityLevel(host) + flags.security
    return {
        host,
        securityThreshold,
    }
}

/**
 * Print the help text.
 * 
 * @param {NS} ns
 */
function printHelp(ns) {
    const scriptName = ns.getScriptName()
    ns.tprintf('\n')
    ns.tprintf('This script will generate money by hacking a target server.')
    for (const [option, value, text] of options) {
        ns.tprintf(`--%(option)-14s${text.join('\n\t\t')}`, { option, scriptName, value })
    }
    ns.tprintf('\n')
    ns.tprintf(`USAGE: run ${scriptName} <server>`)
    ns.tprintf("Example:")
    ns.tprintf(`> run ${scriptName} n00dles`)
}