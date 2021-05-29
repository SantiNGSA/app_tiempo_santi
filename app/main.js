import "../assets/sass/main.scss"
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FudGluZ3NhIiwiYSI6ImNrcDMyMnBpbzF6bDgydnFnZWRoMDkyNjMifQ.u4Ypq7BxQd8vDXJqsxsKRw';

window.addEventListener("load", () => {
   loadMapView();
//    deleteMarkers();

});

let markersPositions;
let mapPosition;
let view;
let map;
let weather;

const loadMarkers = ()=>{

    const localStorageMarkers = localStorage.getItem("markers");
    if(localStorageMarkers == null){
        markersPositions= []
    }else{
        markersPositions = JSON.parse(localStorageMarkers);
    }
};

const loadMapInfo = ()=>{

    const localStoragePosition = localStorage.getItem("map_i");
    if(localStoragePosition == null){
        mapPosition= {
            center:[0,0],
            zoom:11
        };
    }else{
        mapPosition = JSON.parse(localStoragePosition);
    }

};

const loadMapView = () =>{
    view= "map";
    loadMarkers();
    loadMapInfo();
    renderMapViewHeader();
    renderMapViewMain();
    renderMapViewFooter();

};

const renderMapViewHeader = () =>{
    const header = document.querySelector('.header');
    header.innerHTML = `<div class="header_top">
    <img src="../assets/img/logo.png">
    </div>
    <div class="header_bottom">
    <div class="header_text"><span class="fa fa-map-marker"></span><h2> Look for a site </h2> </div><button class="delete">Remove marks</button>
    </div>
    `;
};

const renderMapViewMain = () =>{
    const main = document.querySelector('.main');
    main.innerHTML = '<div id="el_mapa"></div>';
    renderMap();
    renderMarkers();
    initMapEvents();
};

const renderMapViewFooter = () =>{
    const footer = document.querySelector('.footer');
    footer.innerHTML = '<span class="fa fa-location-arrow"></span><span>Go to position</span>';
    footer.addEventListener("click", ()=>{
        flyToLocation();
    });
    
};

const renderMap = () =>{
    map = new mapboxgl.Map({
        container: 'el_mapa',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [mapPosition.lng, mapPosition.lat],
        zoom: mapPosition.zoom
        
    });
    
    
    

};

const renderMarkers = () =>{
    markersPositions.forEach(m =>{
        
        new mapboxgl.Marker().setLngLat([m.coord.lon, m.coord.lat]).addTo(map);
   
    })

};

const flyToLocation = () =>{
    navigator.geolocation.getCurrentPosition((position) =>{
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        map.flyTo({
            center: [lng, lat],
            zoom:12
        })
    });
};


const initMapEvents = () =>{
 map.on("move", (ev) =>{
    const center = ev.target.getCenter();
    const zoom = ev.target.getZoom();
    const storingObj = {
        lat: center.lat,
        lng: center.lng,
        zoom: zoom
    };
    localStorage.setItem("map_i", JSON.stringify(storingObj));
 });
 map.on("click", async(ev) => {
     loadSingleView(ev.lngLat);

 });
};

const loadSingleView = async (lngLat) =>{
    view = "single";
    loadSpinner();
    await fetchData(lngLat);

    unloadSpinner();
    renderSingleViewHeader();
    renderSingleViewMain();
    renderSingleViewFooter();
   


};

const loadSpinner = () =>{
    const spinner = document.querySelector(".spinner")
    spinner.classList.add("opened");
};

const unloadSpinner = ()=>{
    const spinner = document.querySelector(".spinner")
    spinner.classList.remove("opened");
};

const fetchData = async (lngLat) =>{
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lngLat.lat}&lon=${lngLat.lng}&appid=b92eb8a2e5fe79e7ea0cfcf4ebb3d1b8`;
    weather = await fetch(url).then(d => d.json()).then(d => d);
    

   
};

const renderSingleViewHeader = ()=>{
    const header = document.querySelector('.header');
    header.innerHTML = `<button class="fa fa-chevron-left"></button>
                        You are in<strong> ${weather.name} (${weather.sys.country})</strong>`;
    const buttonBack = header.querySelector("button");
    buttonBack.addEventListener("click", () =>{
        loadMapView();
    });
    
};

const renderSingleViewMain = ()=>{
    const main = document.querySelector('.main');
    console.log(weather);
    main.innerHTML = `
    <div class="layer">
    <div class="data_top">
    <div class="temperatura">
    ${Math.round(weather.main.temp-273.15)}º
    </div>
    <div class="data_top_info">
    <div class="typeweather">${weather.weather[0].main}</div>
    
    </div>
    </div>
   
    <div class="data_bottom">
    <div class="minsymaxs">
    <div class="min">Min temperature ${Math.round(weather.main.temp_min-273.15)}º</div>
    <div class="max"> Max temperature ${Math.round(weather.main.temp_max-273.15)}º</div>
     
   
    </div>
    <div class="other">
    <div class="other_item"><span class="fa fa-flag"></span>Wind ${weather.wind.speed}km/h</div>
    <div class="other_item"><span class="fa fa-tint"></span> Humidity: ${weather.main.humidity}%</div>
    <div class="other_item"><span class="fa fa-tachometer"></span> Atmospheric pressure: ${weather.main.pressure}hPa</div>
    <div class="other_item"><span class="fa fa-anchor"></span>Sea level: ${weather.main.pressure}m</div>
    
    </div>
    
  
    </div>
    </div>
    `
    ;
};

const renderSingleViewFooter = ()=>{


    const footer = document.querySelector('.footer');
    footer.innerHTML = '<span class="fa fa-save"></span><span>Mark here</span>';
    footer.addEventListener("click", ()=>{
        saveMarker();
        loadMapView();
    });
 
};

const saveMarker = ()=>{
    markersPositions.push(weather);
    localStorage.setItem("markers", JSON.stringify(markersPositions));
    mapPosition= {
        center:[weather.coord.lon, weather.coord.lat],
        zoom:11
    };
    const storingObj = {
        lat: weather.coord.lat,
        lng: weather.coord.lon,
        zoom: 11
    };
    localStorage.setItem("map_i", JSON.stringify(storingObj));
};

// const deleteMarkers = ()=>{
//     const localStorageMarkers = localStorage.getItem("markers");
//     const borrar = document.querySelector(".delete");
//     borrar.addEventListener("click", ()=>{
//         localStorageMarkers.clear;
//     })

// };

