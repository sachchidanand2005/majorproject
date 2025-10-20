  
      //   mapboxgl.accessToken = window.mapToken;
      //   const map = new mapboxgl.Map({
      //   container: 'map',
      //   style: 'mapbox://styles/mapbox/streets-v12', // Use the standard style for the map
      //  // projection: 'globe', // display the map as a globe
      //   zoom: 9, // initial zoom level, 0 is the world view, higher values zoom in
      //   center: window.listing.geometry.coordinates, // center the map on this longitude and latitude
      //   });

      //  console.log(listing.geometry.coordinates);

      //   const marker = new mapboxgl.Marker({color: "red"})

      //   // .setLngLat(listing.geometry.coordinates)   //listing.geometry.coodinates
      //     .setLngLat(listing.geometry.coordinates)
  

      //   .setPopup(new mapboxgl.Popup({offset: 25})
      //   .setHTML(`<h4>${listing.location}</h4><p> Exact Location will be provided after booking</p>`))
      //   .addTo(map);

    
// mapboxgl.accessToken = window.mapToken;

// const coords = window.listing.geometry?.coordinates;

// // Defensive check
// if (coords && Array.isArray(coords) && coords.length === 2) {
//   const map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v12',
//     zoom: 9,
//     center: coords, // [lng, lat]
//   });

//   new mapboxgl.Marker({ color: "red" })
//     .setLngLat(coords)
//     .setPopup(
//       new mapboxgl.Popup({ offset: 25 })
//         .setHTML(`<h4>${window.listing.location}</h4><p>Exact location will be provided after booking.</p>`)
//     )
//     .addTo(map);
// } else {
//   console.error("Invalid or missing coordinates:", coords);
//  }

// mapboxgl.accessToken = window.mapToken;

// // Ensure coordinates exist and are numbers
// if (window.listing?.geometry?.coordinates?.length === 2) {
//   const coords = window.listing.geometry.coordinates.map(Number); // [lng, lat]

//   const map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v12',
//     zoom: 9,
//     center: coords,
//   });

//   const marker = new mapboxgl.Marker({ color: "red" })
//     .setLngLat(coords)
//     .setPopup(
//       new mapboxgl.Popup({ offset: 25 })
//         .setHTML(`<h4>${window.listing.location}</h4>
//                   <p>Exact Location will be provided after booking</p>`)
//     )
//     .addTo(map);
// } else {
//   console.warn("No valid coordinates found for this listing.");
// }
mapboxgl.accessToken = window.mapToken;

const coordinates = window.listing.geometry?.coordinates;

if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
  console.error("Invalid coordinates:", coordinates);
} else {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 9,
    center: coordinates, // must be [lng, lat]
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${window.listing.location}</h4>
                  <p>Exact location will be provided after booking</p>`)
    )
    .addTo(map);
}



