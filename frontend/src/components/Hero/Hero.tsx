import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconPin, IconBed, IconSearch } from "../Icons/Icons";
import styles from "./Hero.module.css";

const locations = ["Anywhere", "Fiapre", "New Dormaa", "Abesim", "Odeneho Kwadaso"];
const roomTypes = ["Any room type", "1-in-1", "2-in-1", "3-in-1"];

export default function Hero() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Anywhere");
  const [roomType, setRoomType] = useState("Any room type");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location !== "Anywhere") params.set("location", location);
    if (roomType !== "Any room type") params.set("roomType", roomType);
    navigate(`/find-hostel${params.size ? `?${params}` : ""}`);
  }

  return (
    <section className={styles.hero}>
      <div className={`dabi-container ${styles.grid}`}>
        <div className={styles.copy}>
          <span className="dabi-eyebrow-pill">Hostel hunting, made easier</span>
          <h1 className={styles.title}>
            Find your place<br />
            <span className={styles.accent}>near STU.</span>
          </h1>
          <p className={styles.lead}>
            Browse verified hostels around campus — no walking, no guessing.
          </p>

          <form className={styles.search} onSubmit={handleSearch} aria-label="Search hostels">
            <div className={styles.searchField}>
              <IconPin size={16} className={styles.fieldIcon} />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.select}
                aria-label="Location"
              >
                {locations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className={styles.divider} aria-hidden="true" />

            <div className={styles.searchField}>
              <IconBed size={16} className={styles.fieldIcon} />
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className={styles.select}
                aria-label="Room type"
              >
                {roomTypes.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <IconSearch size={20} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
