/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


DEMO = {}

DEMO.mymap={}

DEMO.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    DELETE: "http://tinydev.rerum.io/app/delete",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    OVERWRITE: "http://tinydev.rerum.io/app/overwrite"
}

DEMO.init =  async function(){
    let latlong = [12, 12] //default starting coords
    let historyWildcard = {"$exists":true, "$size":0}
    let geoWildcard = {"$exists":true}
    let geos = []
    document.getElementById("leafLat").oninput = DEMO.updateGeometry
    document.getElementById("leafLong").oninput = DEMO.updateGeometry
    //For my map demo app
    let mapDemoQueryObj = {
        "__rerum.history.next": historyWildcard,
        "madeByUser" : "BryGuy",
        "madeByApp"  : "MapDemo"
    }
    let mapDemoGeos = await fetch(DEMO.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(mapDemoQueryObj)
    })
    .then(response => response.json())
    .then(geoMarkers => {
        return geoMarkers.map(anno => { 
           anno.body["@id"] = anno["@id"] ? anno["@id"] : anno.id ? anno.id : ""
           //We assume the application that created these coordinates did not apply properties.  
           if(!anno.body.hasOwnProperty("properties")){
               anno.body.properties = {}
           }
           anno.body.properties.targetID = anno.target ? anno.target : ""
           return anno.body
        })
    })
    .then(async function(geos) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await geos.map(async function(geoJSON){ 
            let targetURI = geoJSON.properties["@id"] ? geoJSON.properties["@id"] : geoJSON.properties.targetID ? geoJSON.properties.targetID : ""
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown", "madeByApp" : "MapDemo", "isIIIF":false}
            targetProps.targetID = targetURI
            if(geoJSON.hasOwnProperty("properties") && (geoJSON.properties.label || geoJSON.properties.description) ){
                targetProps = geoJSON.properties
            }
            else{
               let targetObj = await fetch(targetURI)
                .then(resp => resp.json())
                .catch(err => {
                    console.error(err)
                    return null
                })
                if(targetObj){
                    isIIIF = DEMO.checkForIIIF(targetObj)
                    targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                    targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                    targetProps = {"targetID":targetURI, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"MapDemo", "isIIIF":isIIIF}
                }
                else{
                    //alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
                } 
            }
            return {"@id":geoJSON["@id"], "properties":targetProps, "type":"Feature", "geometry":geoJSON.geometry} 
        })
        return Promise.all(allGeos)
    })           
    .catch(err => {
        console.error(err)
        return []
    })


    //for my LR app
    let LRDemoQueryObj = {
        "__rerum.history.next": {"$exists":true, "$size":0},
        "creator" : "testMachine", //Bryan in LR
        "type"  : "Annotation",
        "body.geometry" : {"$exists":true}
    }
    let LRDemoGeos = await fetch(DEMO.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(LRDemoQueryObj)
    })
    .then(response => response.json())
    .then(geoMarkers => {
       return geoMarkers.filter(anno => {
//                   anno.body["@id"] = anno["@id"] ? anno["@id"] : anno.id ? anno.id : ""
           return anno.body.geometry.hasOwnProperty("value") && Object.keys(anno.body.geometry.value).length > 0
       })
    })
    .then(async function(annotations) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await annotations.map(async function(annotation){ 
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown",  "madeByApp" : "Lived_Religion", "isIIIF":false}
            targetProps.targetID = annotation.target
            let targetObj = await fetch(annotation.target)
                .then(resp => resp.json())
                .catch(err => {return null})
            if(targetObj){
                //This application created its annotations aa bit differently, so we have to shim the output here.  
                isIIIF = DEMO.checkForIIIF(targetObj)
                targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                targetProps = {"targetID":annotation.target, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"Lived_Religion", "isIIIF":isIIIF}
            }
            else{
                //alert("Target URI could not be resolved.  The annotationtation will still be created and target the URI provided, but certain information will be unknown.")
            }
            return {"@id":annotation["@id"], "properties":targetProps, "type":"Feature", "geometry":annotation.body.geometry.value} 
        })
        return Promise.all(allGeos)
    })
    .catch(err => {
        console.error(err)
        return []
    })

    //For fake app 1
    let mapDemoQueryObj2 = {
        "__rerum.history.next": historyWildcard,
        "madeByUser" : "BryGuy",
        "madeByApp"  : "T-PEN"
    }
    let mapDemoGeos_2 = await fetch(DEMO.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(mapDemoQueryObj2)
    })
    .then(response => response.json())
    .then(geoMarkers => {
        return geoMarkers.map(anno => { 
           anno.body["@id"] = anno["@id"] ? anno["@id"] : anno.id ? anno.id : ""
           //We assume the application that created these coordinates did not apply properties.  
           if(!anno.body.hasOwnProperty("properties")){
               anno.body.properties = {}
           }
           anno.body.properties.targetID = anno.target ? anno.target : ""
           return anno.body
        })
    })
    .then(async function(geos) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await geos.map(async function(geoJSON){ 
            let targetURI = geoJSON.properties["@id"] ? geoJSON.properties["@id"] : geoJSON.properties.targetID ? geoJSON.properties.targetID : ""
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown",  "madeByApp" : "T-PEN", "isIIIF":false}
            targetProps.targetID = targetURI
            let targetObj = await fetch(targetURI)
                .then(resp => resp.json())
                .catch(err => {return null})
            if(targetObj){
                isIIIF = DEMO.checkForIIIF(targetObj)
                targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                targetProps = {"targetID":targetURI, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"T-PEN", "isIIIF":isIIIF}
            }
            else{
                //alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
            }
            return {"@id":geoJSON["@id"],"properties":targetProps, "type":"Feature", "geometry":geoJSON.geometry} 
        })
        return Promise.all(allGeos)
    })
    .catch(err => {
        console.error(err)
        return []
    })

    //For Fake App 2
    let mapDemoQueryObj3 = {
        "__rerum.history.next": historyWildcard,
        "madeByUser" : "BryGuy",
        "madeByApp"  : "Mirador"
    }
    let mapDemoGeos_3 = await fetch(DEMO.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(mapDemoQueryObj3)
    })
    .then(response => response.json())
    .then(geoMarkers => {
       return geoMarkers.map(anno => { 
           anno.body["@id"] = anno["@id"] ? anno["@id"] : anno.id ? anno.id : ""
           //We assume the application that created these coordinates did not apply properties.  
           if(!anno.body.hasOwnProperty("properties")){
               anno.body.properties = {}
           }
           anno.body.properties.targetID = anno.target ? anno.target : ""
           return anno.body
        })
    })
    .then(async function(geos) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await geos.map(async function(geoJSON){ 
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown",  "madeByApp" : "Mirador", "isIIIF":false}
            let targetURI = geoJSON.properties["@id"] ? geoJSON.properties["@id"] : geoJSON.properties.targetID ? geoJSON.properties.targetID : ""
            targetProps.targetID = targetURI
            let targetObj = await fetch(targetURI)
                .then(resp => resp.json())
                .catch(err => {return null})
            if(targetObj){
                isIIIF = DEMO.checkForIIIF(targetObj)
                targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                targetProps = {"targetID":targetURI, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"Mirador", "isIIIF":isIIIF}
            }
            else{
                //alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
            }
            return {"@id":geoJSON["@id"], "properties":targetProps, "type":"Feature", "geometry":geoJSON.geometry} 
        })
        return Promise.all(allGeos)
    })
    .catch(err => {
        console.error(err)
        return []
    })

    //For fake app 3
    let mapDemoQueryObj4 = {
        "__rerum.history.next": historyWildcard,
        "madeByUser" : "BryGuy",
        "madeByApp"  : "IIIF_Coordinates_Annotator"
    }
    let mapDemoGeos_4 = await fetch(DEMO.URLS.QUERY, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(mapDemoQueryObj4)
    })
    .then(response => response.json())
    .then(geoMarkers => {
       return geoMarkers.map(anno => { 
           anno.body["@id"] = anno["@id"] ? anno["@id"] : anno.id ? anno.id : ""
           //We assume the application that created these coordinates did not apply properties.  
           if(!anno.body.hasOwnProperty("properties")){
               anno.body.properties = {}
           }
           anno.body.properties.targetID = anno.target ? anno.target : ""
           return anno.body
        })
    })
    .then(async function(geos) {
        let targetObjDescription, targetObjLabel = ""
        let isIIIF = false
        let allGeos = await geos.map(async function(geoJSON){ 
            let targetProps = {"label":"Target Label Unknown","description":"Target Description Unknown",  "madeByApp" : "IIIF_Coordinates_Annotator", "isIIIF":false}
            let targetURI = geoJSON.properties["@id"] ? geoJSON.properties["@id"] : geoJSON.properties.targetID ? geoJSON.properties.targetID : ""
            targetProps.targetID = targetURI
            let targetObj = await fetch(targetURI)
                .then(resp => resp.json())
                .catch(err => {return null})
            if(targetObj){
                isIIIF = DEMO.checkForIIIF(targetObj)
                targetObjDescription = targetObj.description ? targetObj.description : "Target Description Unknown"
                targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Target Label Unknown"
                targetProps = {"targetID":targetURI, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"IIIF_Coordinates_Annotator", "isIIIF":isIIIF}
            }
            else{
                //alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
            }
            return {"@id":geoJSON["@id"],"properties":targetProps, "type":"Feature", "geometry":geoJSON.geometry} 
        })
        return Promise.all(allGeos)
    })
    .catch(err => {
        console.error(err)
        return []
    })
    //Combine all the corrdinates recieved into one array
    geos = [...mapDemoGeos, ...LRDemoGeos, ...mapDemoGeos_2, ...mapDemoGeos_3, ...mapDemoGeos_4]
    DEMO.initializeMap(latlong, geos)
}
    
DEMO.initializeMap = async function(coords, geoMarkers){
    DEMO.mymap = L.map('leafletInstanceContainer')   
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 100,
        id: 'mapbox.satellite', //mapbox.streets
        accessToken: 'pk.eyJ1IjoidGhlaGFiZXMiLCJhIjoiY2pyaTdmNGUzMzQwdDQzcGRwd21ieHF3NCJ9.SSflgKbI8tLQOo2DuzEgRQ'
    }).addTo(DEMO.mymap);
    DEMO.mymap.setView(coords,8);

    L.geoJSON(geoMarkers, {
        pointToLayer: function (feature, latlng) {
            let appColor = "#336699"
            let creating_app = feature.properties.madeByApp ? feature.properties.madeByApp : "Unknown"
            switch(creating_app){
                case "MapDemo":
                    appColor = "#336699"
                break
                case "Lived_Religion":
                    appColor = "#00cc00"
                break
                case "T-PEN":
                    appColor = "#ff9900"
                break
                case "Mirador":
                    appColor = "#ff3333"
                break
                case "IIIF_Coordinates_Annotator":
                    appColor = "#800060"
                break
                default:
                    appColor = "red"
            }
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: appColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: DEMO.pointEachFeature
    }).addTo(DEMO.mymap)
    leafletInstanceContainer.style.backgroundImage = "none"
    loadingMessage.classList.add("is-hidden")
}

DEMO.pointEachFeature = function (feature, layer) {
    //@id, label, description
    layer.hasMyPoints = true
    layer.isHiding = false
    let popupContent = ""
    if (feature.properties) {
        if(feature.properties.isIIIF){
            popupContent += `<p class="color6 featureCompliance">IIIF Compliant Target</p>`
        }
        if(feature.properties.label) {
            popupContent += `<div class="featureInfo"><label>Target Label:</label>${feature.properties.label}</div>`
        }
        if(feature.properties.targetID || feature.properties["@id"]){
            let targetURI = feature.properties["@id"] ? feature.properties["@id"] : feature.properties.targetID ? feature.properties.targetID : ""
            popupContent += `<div class="featureInfo"><label> Target URI:</label><a target='_blank' href='${targetURI}'>See Target Data</a></div>`
        }
        if(feature.properties.description) {
            popupContent += `<div class="featureInfo"><label> Target Description:</label>${feature.properties.description}</div>`
        }
        if(feature.properties.madeByApp) {
            popupContent += `<div class="featureInfo"><label>Annotation Generated By</label>${feature.properties.madeByApp}</div>`
        }
        if(feature["@id"]) {
            popupContent += `<div class="featureInfo"><label>Annotation URI:</label><a target='_blank' href='${feature["@id"]}'>See Annotation Data</a></div>`
        }
    }
    layer.bindPopup(popupContent);
}

DEMO.goToCoords = function(event){
    if(leafLat.value && leafLong.value){
        let coords = [leafLat.value, leafLong.value]
        DEMO.mymap.flyTo(coords,8)
        document.getElementById("currentCoords").innerHTML = "["+coords.toString()+"]"
    }
}

DEMO.filterMarkers = async function(event){
    let app = event.target.getAttribute("app")
    DEMO.mymap.eachLayer(function(layer) {
        let skipCheck = false
        if ( layer.hasMyPoints ) {
            //remove [pomts nased pm a point.madeByApp property
            if(app === "isIIIF"){
                //Special handler to toggle on this property existing instead of basing it on the creating app (any aapp could have target a IIIF resource).
                if(layer.feature.properties && layer.feature.properties.isIIIF){
                    skipCheck = true
                }
            }
            if(skipCheck || (layer.feature.properties && layer.feature.properties.madeByApp && layer.feature.properties.madeByApp === app)){
                if(layer.isHiding){
                    layer.isHiding = false
                    let creating_app = layer.feature.properties.madeByApp ? layer.feature.properties.madeByApp : "Unknown"
                    let appColor = ""
                    switch(creating_app){
                        case "MapDemo":
                            appColor = "#336699"
                        break
                        case "Lived_Religion":
                            appColor = "#00cc00"
                        break
                        case "T-PEN":
                            appColor = "#ff9900"
                        break
                        case "Mirador":
                            appColor = "#ff3333"
                        break
                        case "IIIF_Coordinates_Annotator":
                            appColor = "#800060"
                        break
                        default:
                            appColor = "#b5a4a3"
                    }
                    layer.setStyle({
                        color: "#000",
                        fillColor : appColor
                    })
                }
                else{
                    layer.isHiding = true 
                    layer.setStyle({
                        color: 'rgba(0,0,0,0)',
                        fillColor : 'rgba(0,0,0,0)'
                    })
                }
            }
        }
    })
}
                      
DEMO.getTargetProperties = async function(event){
    targetProps = {"label":"Unknown","description":"Unknown", "@id":"", "madeByApp":"IIIF_Coordinates_Annotator", "isIIIF":false}
    let target = document.getElementById('objURI').value
    let isIIIF = false
    targetProps["@id"] = target
    let targetObjDescription = "Unknown"
    let targetObjLabel = "Unknown"
    let targetObj = await fetch(target)
        .then(resp => resp.json())
        .catch(err => {return null})
    if(targetObj){
        if(targetObj["@context"]){
            if(Array.isArray(targetObj["@context"])){
                isIIIF = targetObj["@context"].includes("http://iiif.io/api/presentation/3/context.json") || targetObj["@context"].includes("http://iiif.io/api/presentation/2/context.json")
            }
            else if(typeof targetObj["@context"] === "string"){
               isIIIF = targetObj["@context"] === "http://iiif.io/api/presentation/3/context.json" || targetObj["@context"] === "http://iiif.io/api/presentation/2/context.json" 
            }

        }
        targetObjDescription = targetObj.description ? targetObj.description : "Unknown"
        targetObjLabel = targetObj.label ? targetObj.label : targetObj.name ? targetObj.name : "Unknown"
        targetProps = {"@id":target, "label":targetObjLabel, "description":targetObjDescription, "madeByApp":"T-PEN", "isIIIF":isIIIF}
        return targetProps
    }
    else{
        alert("Target URI could not be resolved.  The annotation will still be created and target the URI provided, but certain information will be unknown.")
        return targetProps
    }
} 

/**
 * Connect with the RERUm API to create the Annotation Linked Open Data object.
 * @param {type} event
 * @param {type} app
 * @return {Boolean}
 */
DEMO.submitAnno = async function(event, app){
    let geo = {}
    let lat = parseInt(leafLat.value * 1000000) / 1000000
    let long = parseInt(leafLong.value * 1000000) / 1000000
    if (lat && long) {
        geo = {
            type: "Point",
            coordinates: [long, lat]
        }
    }
    else{
        alert("Supply both a latitude and a longitude")
        return false
    }
    let geoJSON = {
        "@context": "http://geojson.org/geojson-ld/geojson-context.jsonld",
        "properties":{},
        "geometry": geo,
        "type": "Feature"
    }
    let targetURL = document.getElementById('objURI').value
    if(targetURL){
        let demoAnno = 
        {
            "type":"Annotation",
            "@context":"http://www.w3.org/ns/anno.jsonld",
            "motivation":"geocode",
            "target":targetURL,   
            "body":geoJSON,
            "madeByUser" : "BryGuy",
            "madeByApp"  : app
        }

        let createdObj = await fetch(DEMO.URLS.CREATE, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(demoAnno)
        })
        .then(response => response.json())
        .then(newObj => {return newObj.new_obj_state})
        alert("A coordinate annotation was created that targets "+targetURL+".  Enter new coordinates to create another.")
    }
    else{
        alert("The annotation was not created.  You must supply a URI for this annotation to target.")
        return false
    }

}

/**
 * Check if the given object has a valid IIIF context associated with it
 * @param {type} obj
 * @return {Boolean}
 */
DEMO.checkForIIIF = function(targetObj){
    if(targetObj["@context"]){
        if(Array.isArray(targetObj["@context"])){
            return targetObj["@context"].includes("http://iiif.io/api/presentation/3/context.json") || targetObj["@context"].includes("http://iiif.io/api/presentation/2/context.json")
        }
        else if(typeof targetObj["@context"] === "string"){
           return targetObj["@context"] === "http://iiif.io/api/presentation/3/context.json" || targetObj["@context"] === "http://iiif.io/api/presentation/2/context.json" 
        }
    }
    return false
}





