// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2S_qsAQkFiI-v8cnQ9eAjV0r0Ttz_jtg",
  authDomain: "camp-booking-5b648.firebaseapp.com",
  projectId: "camp-booking-5b648",
  storageBucket: "camp-booking-5b648.firebasestorage.app",
  messagingSenderId: "532723833237",
  appId: "1:532723833237:web:ff37b4323544e6b5dfbe9c",
  measurementId: "G-9C7JQ40FNX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 2. สร้างแผนที่ที่นอน
const maleZone = document.getElementById('male-zone');
const femaleZone = document.getElementById('female-zone');

function renderSeats() {
    // ผู้ชาย 230 ที่ (M1 - M230)
    for (let i = 1; i <= 230; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.id = `M${i}`;
        seat.textContent = `M${i}`;
        seat.onclick = () => handleSeatClick(`M${i}`, 'male');
        maleZone.appendChild(seat);
    }

    // ผู้หญิง 160 ที่ (F1 - F160)
    for (let i = 1; i <= 160; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.id = `F${i}`;
        seat.textContent = `F${i}`;
        seat.onclick = () => handleSeatClick(`F${i}`, 'female');
        femaleZone.appendChild(seat);
    }
}
