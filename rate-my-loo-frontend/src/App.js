
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function App() {
  const [toilets, setToilets] = useState([]);
  const [formState, setFormState] = useState({});
  const [summaries, setSummaries] = useState({});
  const [userPosition, setUserPosition] = useState(defaultPosition);

  useEffect(() => {
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
      window.location.reload();
    });
  };

  return (
    <div className="h-screen w-screen">
      <h1 className="text-center text-3xl font-bold p-4">Rate My Loo 🚻</h1>
      <MapContainer center={userPosition} zoom={15} className="h-[85%] w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FetchToilets setToilets={setToilets} setSummaries={setSummaries} />
        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.lat, toilet.lon]}
            icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", iconSize: [25, 25] })}
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
      </MapContainer>
    </div>
  );
}

export default App;
