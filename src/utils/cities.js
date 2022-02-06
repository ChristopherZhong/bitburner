export class City {
    name

    /**
     * @param {string} name 
     */
    constructor(name) {
        this.name = name
    }

    static Aevum = new City('Aevum')
    static Chongqing = new City('Chongqing')
    static Ishima = new City('Ishima')
    static New_Tokyo = new City('New Tokyo')
    static Sector_12 = new City('Sector-12')
    static Volhaven = new City('Volhaven')
}

export const names = Object.keys(City).map((key) => City[key].name)
// console.log(names)