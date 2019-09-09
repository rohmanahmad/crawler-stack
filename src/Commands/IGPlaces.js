'use strict'

if (typeof use !== 'function') require('../App/Bootstrap')
const { MongoAdapter } = use('Libs/DbAdapter')
const IGPlaceLocation = use('Services/IGPlaceLocation')

const sleep = function (timeout = 10) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout * 1000)
    })
}

class IGPlace {
    constructor () {
        this.db = new MongoAdapter()
            .setURI('MONGODB_URI_TRENDS')
            .models([
                'InstagramLocationCities',
                'InstagramLocationPlaces'
            ])
            .setup()
        this.placeLoc = new IGPlaceLocation()
    }

    async run () {
        try {
            let {next, items} = await this.getLocations()
            await this.loopingLocations(items)
            while (next) {
                const x = await this.getLocations(next)
                next = x.next
                await this.loopingLocations(x.items)
            }
            console.log('all crawler has finish')
        } catch (err) {
            console.log(err)
        }
    }

    async loopingLocations (data = []) {
        try {
            for (let i of data) {
                await this.getPlace(i.city)
            }
        } catch (err) { throw err }
    }

    async getLocations (start = 0) {
        try {
            const limit = 1
            const query = await this.db
                .InstagramLocationCities
                .find({
                    crawled: {$ne: true}
                })
                .skip(start)
                .limit(limit)
            return {
                next: query.length === limit ? (start + 1) : 0,
                items: query.map(x => ({id: x._id, city: x.city_id}))
            }
        } catch (err) { throw err }
    }

    async getPlace (cityId = '') {
        try {
            if (!cityId) throw 'Invalid City ID'
            let {location_list: locList, next_page: nPage} = await this.placeLoc
                .setCity(cityId)
                .setPage(0)
                .getPlacesByCity()
            while (nPage) {
                try {
                    await this.updateIgPlace(cityId, locList)
                    await sleep(10)
                    const pc = await this.placeLoc
                        .setPage(nPage)
                        .setCity(cityId)
                        .getPlacesByCity(cityId)
                    nPage = pc.next_page
                    locList = pc.location_list
                } catch (err) {
                    console.log(err)
                    locList = pc.location_list
                }
            }
            await this.updateLastCrawled(cityId, nPage)
            console.log(`[${cityId}]:`, 'ig place done')
        } catch (err) {
            console.log(err)
        }
    }
    async updateIgPlace (cityId, data) {
        try {
            for (let x of data) {
                const o = await this.db
                    .InstagramLocationPlaces
                    .updateOne(
                        {
                            place_id: x.id,
                            city_id: cityId
                        },
                        {
                            $set: {
                                updated_at: new Date()
                            },
                            $setOnInsert: {
                                city_id: cityId,
                                place_id: x.id,
                                place_name: x.name,
                                place_slug: x.slug,
                                created_at: new Date()
                            }
                        },
                        {upsert: true}
                    )
            }
        } catch (err) { throw err }
    }
    async updateLastCrawled (cityId, curPage) {
        try {
            this.db
                .InstagramLocationCities
                .updateOne(
                    {'city_id': cityId},
                    {
                        $set: {
                            updated_at: new Date(),
                            last_crawled: {
                                page: curPage,
                                at: new Date()
                            }
                        }
                    })
        } catch (err) { throw err }
    }
}

new IGPlace().run()