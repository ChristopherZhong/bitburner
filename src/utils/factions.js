export class Faction {
    name
    isCity

    /**
     * @param {string} name
     * @param {boolean} isCity
     */
    constructor(name, isCity = false) {
        this.name = name
        this.isCity = isCity
    }

    static Aevum = new Faction('Aevum', true)
    static Bachman_and_Associates = new Faction('Bachman & Associates')
    static BitRunners = new Faction('BitRunners')
    static Blade_Industries = new Faction('Blade Industries')
    static Bladeburners = new Faction('Bladeburners')
    static Chongqing = new Faction('Chongqing', true)
    static Church_of_the_Machine_God = new Faction('Church of the Machine God')
    static Clarke_Incorporated = new Faction('Clarke Incorporated')
    static CyberSec = new Faction('CyberSec')
    static Daedalus = new Faction('Daedalus')
    static ECorp = new Faction('ECorp')
    static Four_Sigma = new Faction('Four Sigma')
    static Fulcrum_Secret_Technologies = new Faction('Fulcrum Secret Technologies')
    static Illuminati = new Faction('Illuminati')
    static Ishima = new Faction('Ishima', true)
    static KuaiGong_International = new Faction('KuaiGong International')
    static MegaCorp = new Faction('MegaCorp')
    static NWO = new Faction('NWO')
    static Netburners = new Faction('Netburners')
    static New_Tokyo = new Faction('New Tokyo', true)
    static NiteSec = new Faction('NiteSec')
    static OmniTek_Incorporated = new Faction('OmniTek Incorporated')
    static Sector_12 = new Faction('Sector-12', true)
    static Silhouette = new Faction('Silhouette')
    static Slum_Snakes = new Faction('Slum Snakes')
    static Speakers_for_the_Dead = new Faction('Speakers for the Dead')
    static Tetrads = new Faction('Tetrads')
    static The_Black_Hand = new Faction('The Black Hand')
    static The_Covenant = new Faction('The Covenant')
    static The_Dark_Army = new Faction('The Dark Army')
    static The_Syndicate = new Faction('The Syndicate')
    static Tian_Di_Hui = new Faction('Tian Di Hui')
    static Volhaven = new Faction('Volhaven', true)
}

export const names = Object.keys(Faction).map((key) => Faction[key].name)
// console.log(names.length, names)
export const cityFactions = Object.keys(Faction).filter((key) => Faction[key].isCity).map((key) => Faction[key].name)
// console.log(cityFactions.length, cityFactions)