/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

        let leafy = {}
        
        leafy.demo = {}
        
        leafy.URLS = {
            BASE_ID: "http://devstore.rerum.io/v1",
            DELETE: "http://tinydev.rerum.io/app/delete",
            CREATE: "http://tinydev.rerum.io/app/create",
            UPDATE: "http://tinydev.rerum.io/app/update",
            QUERY: "http://tinydev.rerum.io/app/query",
            OVERWRITE: "http://tinydev.rerum.io/app/overwrite"
        }
        
        leafy.mymap = ""
        leafy.util = {}
        leafy.err = {}
        
        leafy.err.generic = function(error){
            alert(error)
        }
        
        leafy.err.handleHTTPError = function(response){
            if (!response.ok){
                let status = response.status;
                switch(status){
                    case 400:
                        console.log("Bad Request")
                    break;
                    case 401:
                        console.log("Request was unauthorized")
                    break;
                    case 403:
                        console.log("Forbidden to make request")
                    break;
                    case 404:
                        console.log("Not found")
                    break;
                    case 500:
                        console.log("Internal server error")
                    break;
                    case 503:
                        console.log("Server down time")
                    break;
                    default:
                        console.log("unahndled HTTP ERROR")
                }
                throw Error("HTTP Error: "+response.statusText)
            }
            return response
        }
        
        leafy.util.resolveForJSON = async function(id){
            let j = {}
            if(id){
                await fetch(id)
                    .then(leafy.err.handleHTTPError)
                    .then(resp => j = resp.json())
                    .catch(error => leafy.err.generic(error))
            }
            else{
                leafy.err.generic("No id provided to resolve for GeoJSON.  Make sure you have an id.")
            }
            return j
        }
        
        leafy.util.getURLVariable = function (variable){
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if(pair[0] == variable){return pair[1];}
            }
            return(false);
        }
        
        leafy.util.readInParishPolygons = async function(){
            let polygons = await fetch('./geo-data/parishes.geojson')
            .then(response => response.text())
            polygons = JSON.parse(polygons)
            return polygons
        }
        
        leafy.util.initializeParishesMap = async function(coords){
            leafy.mymap = L.map('leafletInstanceContainer')    
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 100,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
            }).addTo(leafy.mymap);
            leafy.mymap.setView(coords,8);

            let geoMarkers = await leafy.util.readInParishPolygons() //Need to load the data from /geo-data/parishes.geojson 
            let myStyle = {
                "color": "#ff7800",
                "weight": 2,
                "opacity": 0.65
            }

            L.geoJSON(geoMarkers, {
                style: myStyle
            }).addTo(leafy.mymap)
            
            leafy.mymap.on('click', leafy.util.onMapClick)
        }
        
        leafy.demo.initializeDemoMap = async function(coords, geoMarkers){
            leafy.mymap = L.map('leafletInstanceContainer')   
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 100,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
            }).addTo(leafy.mymap);
            leafy.mymap.setView(coords,8);

            L.geoJSON(geoMarkers, {
		pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
		onEachFeature: leafy.demo.pointEachFeature
            }).addTo(leafy.mymap)
        }
        
        leafy.demo.pointEachFeature = function (feature, layer) {
            //@id, label, description
            let featureText = feature.properties["@id"]
            let popupContent = ""
            if (feature.properties && feature.properties.label) {
                popupContent += `<h6>${feature.properties.label}</h6>`
            }
            if (feature.properties && feature.properties["@id"]) {
                popupContent += `<p> <a target='_blank' href='${featureText}'>See Data Artifact</a></p>`
            }
            if (feature.properties && feature.properties.description) {
                popupContent += `<p>${feature.properties.description}</p>`
            }
            layer.bindPopup(popupContent);
	}
        
        leafy.demo.goToCoords = function(event){
            let coords = [leafLat.value, leafLong.value]
            leafy.mymap.setView(coords,8)
            document.getElementById("currentCoords").innerHTML = coords.toString()
        }
        
        leafy.demo.refreshMarkers = async function(){
            let historyWildcard = {"$exists":true, "$size":0}
            let queryObj = {
                "__rerum.history.next": historyWildcard,
                "madeByUser" : "BryGuy",
                "madeByApp"  : "MapDemo"
            }
            let geoMarkers = await fetch(leafy.URLS.QUERY, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(queryObj)
            })
            .then(response => response.json())
            L.geoJSON().remove() //Remove the old geoJSON layer
            L.geoJSON(geoMarkers, {
		pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
		onEachFeature: leafy.demo.pointEachFeature
            }).addTo(leafy.mymap)
        }
        
        leafy.demo.submitAnno = async function(event){
            let targetURL = document.getElementById('objURL').value
            let targetObj =  await fetch(targetURL).then(response => response.json())
            let lat = document.getElementById('lat').value
            let long = document.getElementById('long').value
            let targetLabel = targetObj.label ? targetObj.label : targetObj.name? targetObj.name : "Unknown Label"
            let targetDescription = targetObj.description ? targetObj.description : "No Description"
            let demoAnno = 
            {
                "type":"Annotation",
                "@context":"http://www.w3.org/ns/anno.jsonld",
                "target":targetURL,   
                body:{
                    "type": "Feature", 
                    "properties": { 
                        "label": targetLabel, 
                        "description": targetDescription
                    }, 
                    "geometry": { 
                        "type": "Point", "coordinates": [long, lat] 
                    }
                },
                "madeByUser" : "BryGuy",
                "madeByApp"  : "MapDemo"
            }
            
            let createdObj = await fetch(leafy.URLS.CREATE, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(demoAnno)
            })
            .then(response => response.json())
            .then(newObj => {return newObj.new_obj_state})
            console.log(createdObj)
        }
            
        leafy.util.initializeMap = async function(coords){
            let geoURL = leafy.util.getURLVariable("geo")
            let geoAnno, features
            if(geoURL){
                geoAnno = await leafy.util.resolveForJSON(geoURL)
                coords = geoAnno.geometry.coordinates
                features = JSON.parse(JSON.stringify(geoAnno))
            }            
            
            leafy.mymap = L.map('leafletInstanceContainer').setView(coords, 10)    
            setTimeout(function(){
                leafy.mymap.flyTo(coords,18);
            }, 2000);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 100,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
            }).addTo(leafy.mymap);
            
             let tom = {
                     "properties": {
                         "name": "SLU Test",
                         "amenity": "Outside SLU",
                         "popupContent": "This is for our SLU test",
                         "openDataID" : "http://devstore.rerum.io/v1/id/5bc7f853e4b09992fca2220e",
                         "cemProjLink" : "http://cemetery.rerum.io/mcelwee/annotationPage.html?personURL=http://devstore.rerum.io/v1/id/5bc7f853e4b09992fca2220e"
                     },
                     "geometry": {
                         "type": "Point",
                         "coordinates": [-90.2348,38.636524]
                     },
                     "type": "Feature",
                     "id":1
                 }

//                let brit = {
//                    "properties": {
//                        "name": "Something for Brittany",
//                        "amenity": "At WWT in Maryland Heights",
//                        "popupContent": "Bryan loves Brittany",
//                        "openDataID" : "",
//                        "cemProjLink" : "https://www.slsc.org/exhibits-attractions/pompeii-the-exhibition/"
//                    },
//                    "geometry": {
//                        "type": "Point",
//                        "coordinates": [-90.449255, 38.702154]
//                    },
//                    "type": "Feature",
//                    "id":1
//                }
                     
            L.geoJSON(tom, {
		pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                            radius: 8,
                            fillColor: "#ff7800",
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                    });
                },
		onEachFeature: leafy.util.pointEachFeature
            }).addTo(leafy.mymap)
            
//            var circle = L.circle([38.636524, -90.2348], {
//                color: 'red',
//                fillColor: '#f03',
//                fillOpacity: 0.5,
//                radius: 500
//            })
//            
//            var polygon = L.polygon([
//                [38.636526, -90.23484],
//                [38.636533, -90.234767],
//                [38.636491, -90.234777]
//            ]).addTo(leafy.mymap)

            leafy.mymap.on('click', leafy.util.onMapClick)
        }
        
        leafy.util.pointEachFeature = function (feature, layer) {
            let featureText = feature.properties.cemProjLink
            let popupContent = ""
            if(featureText){
                popupContent += "<p> <a target='_blank' href='"+featureText+"'>Link to Anything!</a></p>";
            }
            if (feature.properties && feature.properties.popupContent) {
                popupContent += feature.properties.popupContent
            }
            layer.bindPopup(popupContent);
	}
        
        //let popup = L.popup()
        leafy.util.onMapClick = function (e) {
            let popup = L.popup()
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(leafy.mymap);
        }