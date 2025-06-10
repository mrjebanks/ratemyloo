
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

const defaultPosition = [51.505, -0.09];

function FetchToilets({ setToilets, setSummaries }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();

      const query = `
        [out:json];
        node["amenity"="toilets"](${south},${west},${north},${east});
        out body;
      `;

      fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      })
        .then((res) => res.json())
        .then((data) => {
          const nodes = data.elements.map((el) => ({
            id: el.id.toString(),
            lat: el.lat,
            lon: el.lon,
            name: el.tags?.name || "Unnamed Toilet",
          }));
          setToilets(nodes);
          nodes.forEach((toilet) => {
            fetch(`https://rmlbackend-production.up.railway.app/summary?toilet_id=${toilet.id}`)
              .then((res) => res.ok ? res.json() : null)
              .then((data) => {
                if (data) {
                  setSummaries((prev) => ({ ...prev, [toilet.id]: data }));
                }
              });
          });
        });
    }
  });
  return null;
}

function LocateButton({ userLocation }) {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (userLocation) map.flyTo(userLocation, 16);
      }}
      className="absolute z-[999] bottom-4 right-4 bg-blue-600 text-white p-2 rounded shadow"
    >
      📍 My Location
    </button>
  );
}

function SearchControl() {
  const map = useMap();
  useEffect(() => {
    fetch("https://rmlbackend-production.up.railway.app/custom-toilets")
      .then((res) => res.json())
      .then((data) => setCustomToilets(data));
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      searchLabel: "Search for a place",
      keepResult: true
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
}


function AddToiletClickHandler({ addMode, setCustomToilets }) {
  useMapEvents({
    click: (e) => {
      if (!addMode) return;
      const name = prompt("Enter a name for this toilet:");
      if (!name) return;
      fetch("https://rmlbackend-production.up.railway.app/custom-toilets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          lat: e.latlng.lat,
          lon: e.latlng.lng
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setCustomToilets((prev) => [...prev, data]);
          alert("Custom toilet added!");
        });
    }
  });
  return null;
}


function App() {
  const [customToilets, setCustomToilets] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [toilets, setToilets] = useState([]);
  const [formState, setFormState] = useState({});
  const [summaries, setSummaries] = useState({});
  const [userPosition, setUserPosition] = useState(defaultPosition);

  useEffect(() => {
    fetch("https://rmlbackend-production.up.railway.app/custom-toilets")
      .then((res) => res.json())
      .then((data) => setCustomToilets(data));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      () => {
        console.warn("Location access denied or unavailable.");
      }
    );
  }, []);

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [name]: value },
    }));
  };

  const handleSubmit = (id, e) => {
    e.preventDefault();
    const review = formState[id];
    fetch("https://rmlbackend-production.up.railway.app/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toilet_id: id,
        rating: parseInt(review.rating),
        cleanliness: parseInt(review.cleanliness),
        accessibility: parseInt(review.accessibility),
        baby_changing: parseInt(review.baby_changing),
        comment: review.comment,
      }),
    }).then(() => {
      alert("Review submitted!");
      
      fetch(`https://rmlbackend-production.up.railway.app/summary?toilet_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setSummaries((prev) => ({ ...prev, [id]: data }));
          alert("Review submitted!");
        });
    
    });
  };

  const toiletIcon = new L.Icon({
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/PublicToiletIcon.svg/1024px-PublicToiletIcon.svg.png",
    iconSize: [35, 35],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });

  return (
    <div className="relative h-screen w-screen">
      <h1 className="text-center text-3xl font-bold p-4">Rate My Loo 🚻</h1>
      
    <button onClick={() => setAddMode(!addMode)} className="absolute z-[999] top-4 right-4 bg-green-600 text-white px-3 py-1 rounded shadow">
      {addMode ? "🛑 Cancel Add" : "➕ Add Toilet"}
    </button>
    <MapContainer
        
 center={userPosition}
        whenCreated={(map) => {
          map.on("click", function (e) {
            if (!addMode) return;
            const name = prompt("Enter a name for this toilet:");
            if (!name) return;
            fetch("https://rmlbackend-production.up.railway.app/custom-toilets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name,
                lat: e.latlng.lat,
                lon: e.latlng.lng
              })
            }).then(() => {
              alert("Custom toilet added!");
              
      fetch(`https://rmlbackend-production.up.railway.app/summary?toilet_id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setSummaries((prev) => ({ ...prev, [id]: data }));
          alert("Review submitted!");
        });
    
            });
          });
        }}
 zoom={15} className="h-[85%] w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FetchToilets setToilets={setToilets} setSummaries={setSummaries} />
        <SearchControl />
        <LocateButton userLocation={userPosition} />
        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.lat, toilet.lon]}
            icon={toiletIcon}
          >
            <Popup>
              <h2 className="font-bold">{toilet.name}</h2>
              {summaries[toilet.id] && (
                <div className="text-sm pb-2">
                  <p>⭐ Overall: {summaries[toilet.id].average_rating.toFixed(1)}</p>
                  <p>🧼 Cleanliness: {summaries[toilet.id].cleanliness.toFixed(1)}</p>
                  <p>♿ Accessibility: {summaries[toilet.id].accessibility.toFixed(1)}</p>
                  <p>👶 Baby Changing: {summaries[toilet.id].baby_changing.toFixed(1)}</p>
                </div>
              )}
              <form onSubmit={(e) => handleSubmit(toilet.id, e)} className="space-y-1 text-sm">
                <label>Rating (1-5):<br />
                  <input name="rating" type="number" min="1" max="5" required
                    onChange={(e) => handleChange(toilet.id, e)} />
                </label><br />
                <label>Cleanliness:<br />
                  <input name="cleanliness" type="number" min="1" max="5" required
                    onChange={(e) => handleChange(toilet.id, e)} />
                </label><br />
                <label>Accessibility:<br />
                  <input name="accessibility" type="number" min="1" max="5" required
                    onChange={(e) => handleChange(toilet.id, e)} />
                </label><br />
                <label>Baby Changing:<br />
                  <input name="baby_changing" type="number" min="1" max="5" required
                    onChange={(e) => handleChange(toilet.id, e)} />
                </label><br />
                <label>Comment:<br />
                  <textarea name="comment" rows="2"
                    onChange={(e) => handleChange(toilet.id, e)} />
                </label><br />
                <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">Submit</button>
              </form>
            </Popup>
          </Marker>
        ))}
      
      <Marker
        position={userPosition}
        icon={new L.Icon({
          iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/OOjs_UI_icon_userAvatar.svg/1024px-OOjs_UI_icon_userAvatar.svg.png",
          iconSize: [35, 35],
          iconAnchor: [17, 34],
          popupAnchor: [0, -30]
        })}
      >
        <Popup>You are here</Popup>
      </Marker>
    
      {customToilets.map((toilet) => (
        <Marker
          key={"custom_" + toilet.id}
          position={[toilet.lat, toilet.lon]}
          icon={new L.Icon({
            iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/ToiletIcon.svg/1024px-ToiletIcon.svg.png",
            iconSize: [35, 35],
            iconAnchor: [17, 34],
            popupAnchor: [0, -30]
          })}
        >
          <Popup>
            <h2 className="font-bold">{toilet.name}</h2>
            
<p className="text-sm italic">User-submitted toilet</p>
<form onSubmit={(e) => handleSubmit("custom_" + toilet.id, e)} className="space-y-1 text-sm mt-2">
  <label>Rating (1-5):<br />
    <input name="rating" type="number" min="1" max="5" required
      onChange={(e) => handleChange("custom_" + toilet.id, e)} />
  </label><br />
  <label>Cleanliness:<br />
    <input name="cleanliness" type="number" min="1" max="5" required
      onChange={(e) => handleChange("custom_" + toilet.id, e)} />
  </label><br />
  <label>Accessibility:<br />
    <input name="accessibility" type="number" min="1" max="5" required
      onChange={(e) => handleChange("custom_" + toilet.id, e)} />
  </label><br />
  <label>Baby Changing:<br />
    <input name="baby_changing" type="number" min="1" max="5" required
      onChange={(e) => handleChange("custom_" + toilet.id, e)} />
  </label><br />
  <label>Comment:<br />
    <textarea name="comment" rows="2"
      onChange={(e) => handleChange("custom_" + toilet.id, e)} />
  </label><br />
  <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">Submit</button>
</form>

          </Popup>
        </Marker>
      ))}

      <Marker
        position={userPosition}
        icon={new L.Icon({
          iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/OOjs_UI_icon_userAvatar.svg/1024px-OOjs_UI_icon_userAvatar.svg.png",
          iconSize: [35, 35],
          iconAnchor: [17, 34],
          popupAnchor: [0, -30]
        })}
      >
        <Popup>You are here</Popup>
      </Marker>
    <AddToiletClickHandler addMode={addMode} setCustomToilets={setCustomToilets} />
</MapContainer>
    
    
    </div>
  );
}

export default App;
