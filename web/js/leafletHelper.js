/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

        let leafy = {}
        
        
        leafy.mymap = ""
        leafy.util = {}
        leafy.err = {}
        
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
                    .catch(error => leaflet.err(error))
            }
            else{
                leaflet.err("No id provided to resolve for JSON.  Make sure you have an id.")
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
            
        leafy.util.initializeMap = function(coords){
            let geoURL = leafy.util.getURLVariable("geo")
            let geoAnno = leafy.util.resolveForJSON(geoURL)
            let coords = geoAnno.geometry.coordinates
            
            leafy.mymap = L.map('leafletInstanceContainer').setView(coords, 14)    
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.satellite', //mapbox.streets
            accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
            }).addTo(leafy.mymap);
            
            //Or just use the whole geo anno if you have formed it right...
            let feature = JSON.parse(JSON.stringify(geoAnno))
                     
            let featureCollection = {
                "type": "FeatureCollection",
                "features":[
                    {
                        "properties": {
                            "name": "Claud H. B. Bland",
                            "amenity": "Buried Human",
                            "popupContent": "This is Claud, he is dead",
                            "openDataID" : "http://devstore.rerum.io/v1/id/5bc7f853e4b09992fca2220e",
                            "cemProjLink" : "http://cemetery.rerum.io/mcelwee/annotationPage.html?personURL=http://devstore.rerum.io/v1/id/5bc7f853e4b09992fca2220e"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.150088, 39.40209]
                        },
                        "type": "Feature",
                        id:1
                    },
                    {
                        "properties": {
                            "name": "Elizabeth C. Carr",
                            "amenity": "Buried Human",
                            "popupContent": "This is Elizabeth, she is a stationary zombie",
                            "openDataID" : "http://devstore.rerum.io/v1/id/5bc8075ae4b09992fca2221f",
                            "cemProjLink": "http://cemetery.rerum.io/mcelwee/annotationPage.html?personURL=http://devstore.rerum.io/v1/id/5bc8075ae4b09992fca2221f"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.149584, 39.402057]
                        },
                        "type": "Feature",
                        id:2
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "McElwee Cemetery",
                            "amenity": "Human Cemetery",
                            "popupContent": "This is where our people are buried!",
                            "openDataID" : "http://devstore.rerum.io/v1/id/5c100ecce4b05b14fb531ed0",
                            "cemProjLink": "http://cemetery.rerum.io/mcelwee/main.html"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.148769,39.402507]
                        },
                        id:3
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "name": "McElwee Cemetery Zombie Housing",
                            "amenity": "Zombies!",
                            "popupContent": "Zombies can find affordable home rentals here",
                            "openDataID" : "",
                            "cemProjLink": ""
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-91.145743, 39.408051]
                        },
                        id:5
                    }
                ]
            }
            
            L.geoJSON(feature, {
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
		onEachFeature: pointEachFeature
            }).addTo(mymap)

            leafy.mymap.on('click', onMapClick)
        }
        
        leafy.util.pointEachFeature = function (feature, layer) {
            let featureText = feature.properties.cemProjLink
            let popupContent = ""
            if(featureText){
                popupContent += "<p> <a target='_blank' href='"+featureText+"'>Cemetery Project Link</a></p>";
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