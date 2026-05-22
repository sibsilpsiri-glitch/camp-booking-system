import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ตั้งค่าจำนวนที่นอน
const MALE_SPOTS = 230;
const FEMALE_SPOTS = 160;

// ฟังก์ชันสร้างจุดที่นอนใน HTML
function renderSpots() {
    const maleZone = document.getElementById('male-zone');
    const femaleZone = document.getElementById('female-zone');

    // สร้างจุดชาย (M1 - M230)
    for (let i = 1; i <= MALE_SPOTS; i++) {
        const spotId = `M${i}`;
        const spotEl = createSpotElement(spotId, 'male');
        maleZone.appendChild(spotEl);
    }

    // สร้างจุดหญิง (F1 - F160)
    for (let i = 1; i <= FEMALE_SPOTS; i++) {
        const spotId = `F${i}`;
        const spotEl = createSpotElement(spotId, 'female');
        femaleZone.appendChild(spotEl);
    }
}

function createSpotElement(id, genderClass) {
    const div = document.createElement('div');
    div.id = id;
    div.className = `spot ${genderClass}`;
    div.innerText = id;
    
    div.addEventListener('click', () => handleSpotClick(id));
    return div;
}

// ฟังก์ชันจัดการเมื่อคลิกที่จุดจอง
async function handleSpotClick(spotId) {
    const spotEl = document.getElementById(spotId);
    
    // 1. เช็คก่อนว่าจองไปหรือยัง (ตรวจสอบผ่าน UI เบื้องต้น)
    if (spotEl.classList.contains('booked')) {
        // ดึงข้อมูลผู้จองมาแสดง
        const docRef = doc(db, "bookings", spotId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            Swal.fire({
                title: `จุด ${spotId} ถูกจองแล้ว`,
                html: `
                    <div class="text-left text-sm space-y-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p><strong>ชื่อ-สกุล:</strong> ${data.fullName}</p>
                        <p><strong>ชื่อเล่น:</strong> ${data.nickname}</p>
                        <p><strong>คณะ:</strong> ${data.faculty}</p>
                        <p><strong>ชั้นปี:</strong> ${data.year}</p>
                        <p><strong>สังกัด:</strong> ${data.department}</p>
                        <p><strong>mixi2:</strong> ${data.mixi2}</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonColor: '#3b82f6',
                confirmButtonText: 'ปิดหน้าต่าง'
            });
        }
        return;
    }

    // 2. ถ้ายังไม่จอง ให้เปิดฟอร์มกรอกข้อมูล
    const { value: formValues } = await Swal.fire({
        title: `จองที่นอน ${spotId}`,
        html: `
            <div class="space-y-3 text-left">
                <input id="swal-input-fullname" class="swal2-input !w-full !m-0 text-sm" placeholder="ชื่อ-นามสกุล" autocomplete="off">
                <input id="swal-input-nickname" class="swal2-input !w-full !m-0 text-sm" placeholder="ชื่อเล่น" autocomplete="off">
                <input id="swal-input-faculty" class="swal2-input !w-full !m-0 text-sm" placeholder="คณะ" autocomplete="off">
                <select id="swal-input-year" class="swal2-input !w-full !m-0 text-sm h-auto py-3">
                    <option value="" disabled selected>เลือกชั้นปี</option>
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                </select>
                <input id="swal-input-department" class="swal2-input !w-full !m-0 text-sm" placeholder="สังกัด/ชมรม" autocomplete="off">
                <input id="swal-input-mixi2" class="swal2-input !w-full !m-0 text-sm" placeholder="Account mixi2" autocomplete="off">
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'ยืนยันการจอง',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981', // emerald-500
        cancelButtonColor: '#ef4444',
        preConfirm: () => {
            const fullName = document.getElementById('swal-input-fullname').value;
            const nickname = document.getElementById('swal-input-nickname').value;
            const faculty = document.getElementById('swal-input-faculty').value;
            const year = document.getElementById('swal-input-year').value;
            const department = document.getElementById('swal-input-department').value;
            const mixi2 = document.getElementById('swal-input-mixi2').value;

            if (!fullName || !nickname || !faculty || !year || !department || !mixi2) {
                Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
                return false;
            }
            return { fullName, nickname, faculty, year, department, mixi2, timestamp: new Date() };
        }
    });

    if (formValues) {
        // ทำการบันทึกลง Database
        saveBooking(spotId, formValues);
    }
}

async function saveBooking(spotId, data) {
    try {
        const docRef = doc(db, "bookings", spotId);
        // setDoc จะทำงานก็ต่อเมื่อข้อมูลตรงนั้นไม่เคยมีมาก่อน (อ้างอิงจาก Rules ใน Firestore)
        await setDoc(docRef, data);
        
        Swal.fire({
            icon: 'success',
            title: 'จองสำเร็จ!',
            text: `คุณได้จองจุด ${spotId} เรียบร้อยแล้ว (ไม่สามารถยกเลิกได้)`,
            confirmButtonColor: '#10b981'
        });
    } catch (error) {
        console.error("Error saving booking: ", error);
        Swal.fire({
            icon: 'error',
            title: 'จองไม่สำเร็จ',
            text: 'จุดนี้อาจถูกคนอื่นจองไปแล้วในเสี้ยววินาทีที่ผ่านมา หรือระบบขัดข้อง',
            confirmButtonColor: '#ef4444'
        });
    }
}

// 3. ระบบ Real-time Listener ฟังการเปลี่ยนแปลงจากฐานข้อมูล
function listenForBookings() {
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                const spotId = change.doc.id;
                const spotEl = document.getElementById(spotId);
                if (spotEl) {
                    spotEl.classList.add('booked');
                    // เพิ่ม Tooltip เวลาเอาเมาส์ชี้
                    spotEl.title = `จองแล้วโดย ${change.doc.data().nickname} (${change.doc.data().faculty})`;
                }
            }
        });
    });
}

// เริ่มต้นระบบ
renderSpots();
listenForBookings();
