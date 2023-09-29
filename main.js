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
            latLng: {}
        }
    },
    methods: {
    },
    mounted(){
        getLatLng((latLng, error) => {
            if(!error){
                this.latLng = latLng;                
            }
        });
    },
    created() {
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


function getLatLng(cb){
    if (navigator.geolocation) {

        // Call getCurrentPosition with success and error callbacks
        navigator.geolocation.getCurrentPosition(function (position) {

            // On success, position.coords contains latitude and longitude  
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            let latLng = {lat, lng};

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

// async function getData() {
//     console.log('Getting meta data.');
//     let metaData = await (await fetch(baseUrl + '/api/getMetaData')).json();
//     console.log({ metaData });
//     sharedData.metaData = metaData;
// }



(async () => {
    initVue();
    // await getData();

    // console.log('Starting web-socket');
    // socket = io({
    //     path: '/devops-viewer'
    // });
})()