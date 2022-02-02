import { names } from './utils/companies'

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
    for (const name of names) {
        ns.applyToCompany(name, 'business')
    }
}