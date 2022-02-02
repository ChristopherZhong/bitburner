import { cityFactions } from './utils/factions'

/** 
 * @param {NS} ns
 **/
export async function main(ns) {
    ns.tail()
    while (true) {
        const invitations = ns.checkFactionInvitations()
        for (const invite of invitations) {
            if (cityFactions.includes(invite)) {
                continue
            }
            ns.joinFaction(invite)
        }
        await ns.sleep(1000);
    }
}