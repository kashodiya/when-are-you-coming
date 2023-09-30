// (Internal FR - Source Code)

// sharedData is the storage area used for storing any data that more than 1 components needs
let sharedData = Vue.reactive({
    metaData: {         // Initialized in getMetaData()
    }
})
var socket;     //Initialized in the async block at the bottom this file

const Home = {
    template: '#home-template',
    data() {
        return {
            latLng: {},
            plans: [],
            logs: []
        }
    },
    methods: {
        getTripPlan(stnId){
            if(stnId == 'UCTY'){
                this.logs.unshift('Skipping plan from: ' + stnId);
            }else{
                this.logs.unshift('Finding plas from: ' + stnId);
                planTrip(stnId, 'BERY', (plans) => {
                    console.log({plans});
                    this.plans.push(...plans);
                });
            }
        }
    },
    mounted() {
    },
    created() {
        this.logs.unshift('Getting lat long...')
        getLatLng((latLng, error) => {
            if (!error) {
                this.logs.unshift('Found lat long: ' + latLng.lat + ', ' + latLng.lng)
                this.latLng = latLng;
                // let nextStationId, nearestStnId;
                this.logs.unshift('Finding nearest and next station...')
                const {nextStationId, nearestStnId} = findNearestStation(latLng.lat, latLng.lng);
                console.log({nextStationId, nearestStnId});
                this.getTripPlan(nextStationId);
                this.getTripPlan(nearestStnId);
                // this.logs.unshift('Finding plas from: ' + nextStationId);
                // planTrip(nextStationId, 'BERY', (plans) => {
                //     console.log({plans});
                //     this.plans.push(...plans);
                // });
                // this.logs.unshift('Finding plas from: ' + nearestStnId);
                // planTrip(nearestStnId, 'BERY', (plans) => {
                //     console.log({plans});
                //     this.plans.push(...plans);
                // });
            }else{
                this.logs.unshift('ERROR: Error getting lat long:')
                this.logs.unshift(error);
            }
        });
        console.log('Home created');
    }
}

const About = {
    template: '#about-template',
    data() {
        return {
        }
    },
    methods: {
    },
    created() {
        console.log('About created');
    }
}


function getLatLng(cb) {
    // if(document.location.href.indexOf('127.0.0.1') > -1){
    //     console.log('Using fake lat long');
    //     cb({ lat: 37.69691, lng: -122.12645 }, null);
    // }else 
    if (navigator.geolocation) {

        // Call getCurrentPosition with success and error callbacks
        navigator.geolocation.getCurrentPosition(function (position) {

            // On success, position.coords contains latitude and longitude  
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let latLng = { lat, lng };

            console.log(latLng);
            cb(latLng, null);

            // Use the coordinates here to display location, pinpoint on map, etc.

        }, function (error) {
            console.log(error);
            cb(null, error);
        });

    } else {
        let error = 'Geolocation is not supported';
        cb(null, error);
    }
}

function XXfindNextStation() {
    // Starting station ID
    const stationId = '12TH';

    // Berryessa station ID 
    const destId = 'BERY';

    // BART API endpoint
    const url = 'https://api.bart.gov/api/route.aspx?json=y&cmd=route&orig=' + stationId + '&dest=' + destId + '&key=MW9S-E7SL-26DU-VV8V';

    // Fetch route data 
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log({data});
            

            // Get route plan 
            const plan = data.root.route;

            // Find index of start station
            const startIdx = plan.station.findIndex(s => s.abbr === stationId);

            // Get next station 
            const nextStation = plan.station[startIdx + 1];

            // Log next station details
            console.log('Next Station: ' + nextStation.name);
            console.log('Station Abbr: ' + nextStation.abbr);

        });
}

function planTrip(fromId, toId, cb) {
    // From and to station IDs 
    // const fromId = '12TH'
    // const toId = 'POWL'

    // BART API endpoint
    const url = 'https://api.bart.gov/api/sched.aspx?json=y&cmd=depart&orig=' + fromId + '&dest=' + toId + '&date=today&key=MW9S-E7SL-26DU-VV8V&b=0&a=2&l=1';

    // Fetch schedule data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            console.log(data.root.schedule.request);

            let plans = [];

            data.root.schedule.request.trip.forEach(plan => {
                console.log('From: ' + plan['@origin']);
                console.log('To: ' + plan['@destination']);
                console.log('Departure Time: ' + plan['@origTimeMin']);
                console.log('Arrival Time: ' + plan['@destTimeMin']);
                console.log('Line: ' + plan.leg[0]['@line']);
                plans.push({
                    fromStnId: plan['@origin'],
                    toStnId: plan['@destination'],
                    departTime: plan['@origTimeMin'],
                    arriveTime: plan['@destTimeMin'],
                    line: plan.leg[0]['@line']
                })
            })
            cb(plans)
        });
}

function findNearestStation(lat, lng) {
    let nearest;
    let minDistance = Infinity;
    sharedData.stations.forEach(station => {
        const stationLat = station.gtfs_latitude;
        const stationLng = station.gtfs_longitude;

        // Calculate distance between coordinates
        const distance = Math.sqrt(Math.pow(stationLat - lat, 2) + Math.pow(stationLng - lng, 2));

        // Check if closest
        if (distance < minDistance) {
            nearest = station;
            minDistance = distance;
        }
    });



    const startIdx = sharedData.route6StationIds.findIndex(s => s === nearest.abbr);
    let nearestStnId = nearest.abbr;

    // Log nearest station
    // console.log({nearestStnId, startIdx});


    // Get next station 
    const nextStationId = sharedData.route6StationIds[startIdx + 1];

    // Log next station details
    // console.log('Next Station: ' + nextStationId);

    return {nearestStnId, nextStationId};

}

function XXfindNearestStation(lat, lng) {
    //
    // Lat and long coordinates
    // const lat = 37.7749;
    // const lng = -122.4194;

    // BART API endpoint to get station info
    const url = 'https://api.bart.gov/api/stn.aspx?json=y&cmd=stns&key=MW9S-E7SL-26DU-VV8V';

    // Fetch station data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log({ data });


            // Get array of stations
            const stations = data.root.stations.station;

            // Find nearest station
            let nearest;
            let minDistance = Infinity;
            stations.forEach(station => {
                const stationLat = station.gtfs_latitude;
                const stationLng = station.gtfs_longitude;

                // Calculate distance between coordinates
                const distance = Math.sqrt(Math.pow(stationLat - lat, 2) + Math.pow(stationLng - lng, 2));

                // Check if closest
                if (distance < minDistance) {
                    nearest = station;
                    minDistance = distance;
                }
            });

            // Log nearest station
            console.log(nearest);

        });
}

function XXbart() {
    const API_KEY = 'MW9S-E7SL-26DU-VV8V';

    const url = `https://api.bart.gov/api/etd.aspx?json=y&cmd=etd&orig=RICH&key=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // data is the realtime info in JSON format 
            console.log(data);

            // Access data properties
            const station = data.root.station[0];
            const etd = station.etd;

            // Print train estimates
            etd.forEach(train => {
                console.log(train.destination, train.estimate);
            });

        })
        .catch(error => {
            console.error(error);
        });

}

/*
// Use Bar as a template to create a new component 
const Bar = {
    template: '#bar-template',
    data() {
        return {
        }
    },
    methods: {
    },
    created() {
        console.log('Bar created');
    }
}
*/


function initVue() {
    // Lets create Vue app, configure it to use Vuetify and Vue Router
    const { createApp } = Vue
    const { createVuetify } = Vuetify
    const vuetify = createVuetify();
    const app = createApp({
        el: '#app',
        created() {
            console.log('Vue is created.');
        }
    });

    // Create routes for the browser
    const routes = [
        { path: '/', component: Home },
        { path: '/about', component: About },
        // { path: '/bar', component: Bar }
    ]

    router = VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(),
        routes
    })

    app.use(router);
    app.use(vuetify);
    // This is how to make sharedData available to all the components
    // app.config.globalProperties.sharedData = sharedData;
    app.mount('#app');
}

async function getData() {
    console.log('Getting data...');
    let route6Resp = await (await fetch('/route-6.json')).json();
    let stationsResp = await (await fetch('/stations.json')).json();
    let route6StationIds = route6Resp.root.routes.route.config.station
    let stations = stationsResp.root.stations.station;
    console.log({route6StationIds, stations });
    sharedData.stations = stations;
    sharedData.route6StationIds = route6StationIds;
}



(async () => {
    initVue();
    // bart();
    await getData();

    // console.log('Starting web-socket');
    // socket = io({
    //     path: '/devops-viewer'
    // });
})()