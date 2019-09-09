'use strict'

if (typeof use !== 'function') require('../App/Bootstrap')

const { MongoAdapter } = use('Libs/DbAdapter')
const IgLocator = use('Services/IGLocations')

const sleep = function (timeout = 10) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout * 1000)
    })
}

class InstagramLocation {
    constructor () {
        this.locator = new IgLocator()
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'InstagramLocationCities',
                'InstagramLocationCountries'
            ])
            .setup()
    }

    async run () {
        try {
            // await this.getInstagramCountries()
            await this.getAllCitiesOfCountries()
            // await this.getCitiesLocation('US')
        } catch (err) { throw err }
    }

    async getAllCitiesOfCountries () {
        try {
            const x = await this.db.InstagramLocationCountries.find({}).skip(91)
            for (let country of x) {
                await this.getCitiesLocation(country.country_id)
                await sleep(10)
            }
        } catch (err) { throw err }
    }

    async getInstagramCountries () {
        try {
            let {country_list: countryList, next_page: nPage} = JSON.parse(
                await this.locator
                    .setPage(1)
                    .getCountries()
            )
            // console.log(countryList)
            await this.writeCountriesToDB(countryList)
            while (nPage) {
                try {
                    const p = JSON.parse(
                        await this.locator
                            .setPage(nPage)
                            .getCountries()
                    )
                    nPage = p.next_page
                    await this.writeCountriesToDB(p.country_list)
                    await sleep()
                } catch (err) {
                    console.log(err)
                }
            }
            console.log('crawler done')
        } catch (err) { throw err }
    }

    async getCitiesLocation (country) {
        try {
            country = country || process.env.IG_LOCATION || 'ID'
            const x = await this.locator
                .setCountry(country)
                .setPage(1)
                .getCities()
            let {country_info: cInfo, city_list: cityList, next_page: nPage} = JSON.parse(x)
            await this.writeCitiesToDB(cityList, cInfo)
            while (nPage) {
                try {
                    const p = JSON.parse(
                        await this.locator
                            .setCountry(country)
                            .setPage(nPage)
                            .getCities()
                    )
                    nPage = p.next_page
                    await this.writeCitiesToDB(p.city_list, p.country_info)
                    await sleep()
                } catch (err) {
                    console.log(err)
                }
            }
            console.log('crawler done')
        } catch (err) {
            console.log(err)
        }
    }

    async writeCitiesToDB (data, countryInfo = {}) {
        try {
            for (let d of data) {
                await this.db.InstagramLocationCities.updateOne({
                    city_id: d.id
                }, {
                    $set: { updated_at: new Date() },
                    $setOnInsert: {
                        created_at: new Date(),
                        city_name: d.name,
                        city_slug: d.slug,
                        country_info: {
                            id: countryInfo.id,
                            name: countryInfo.name,
                            slug: countryInfo.slug
                        }
                    }
                }, { upsert: true })
            }
        } catch (err) { throw err }
    }

    async writeCountriesToDB (data) {
        try {
            for (let d of data) {
                await this.db.InstagramLocationCountries.updateOne({
                    country_id: d.id
                }, {
                    $set: { updated_at: new Date() },
                    $setOnInsert: {
                        created_at: new Date(),
                        country_name: d.name,
                        country_slug: d.slug
                    }
                }, { upsert: true })
            }
        } catch (err) { throw err }
    }
}

new InstagramLocation().run()