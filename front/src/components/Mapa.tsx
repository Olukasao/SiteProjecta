import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

export default function Mapa() {
  return (
    <MapContainer
      center={[-23.322, -46.728]} // Franco da Rocha
      zoom={13}
      style={{
        width: "100%",
        height: "380px",
        borderRadius: "16px"
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[-23.322, -46.728]} icon={icon}>
        <Popup>Projecta Empreendimentos</Popup>
      </Marker>
    </MapContainer>
  );
}