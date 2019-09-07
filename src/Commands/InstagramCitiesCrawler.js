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
    constructor (config) {
        this.locator = new IgLocator(config)
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'InstagramLocationCities'
            ])
            .setup()
    }

    async run () {
        try {
            const x = await this.locator.getLocation()
            let {country_info: cInfo, city_list: cityList, next_page: nPage} = JSON.parse(x)
            await this.writeToDB(cityList, cInfo)
            while (nPage) {
                try {
                    const p = JSON.parse(await this.locator.setPage(nPage).getLocation())
                    nPage = p.next_page
                    await this.writeToDB(p.city_list, p.country_info)
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

    async writeToDB (data, countryInfo = {}) {
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
}

new InstagramLocation({
    location: process.env.IG_LOCATION || 'ID',
    page: 1
}).run()