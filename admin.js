let previewData = [];
let previewWeek = 0;
let previewUser = null;
import {
    auth,
    db,
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let sourceUid = null;
let targetUid = null;
// ===============================
// Giriş Kontrolü
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));

    if (!userSnap.exists()) {
        alert("Kullanıcı bilgisi bulunamadı.");
        window.location.href = "index.html";
        return;
    }

    const userData = userSnap.data();

    if (userData.role !== "admin") {
        alert("Bu sayfaya erişim yetkiniz bulunmamaktadır.");
        window.location.href = "index.html";
        return;
    }

    console.log("Admin olarak giriş yapıldı.");

    loadUsers();

});


// ===============================
// Çıkış
// ===============================

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});


// ===============================
// Kullanıcıları Listele
// ===============================

async function loadUsers() {

    const userList = document.getElementById("userList");

    userList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "users"));

    snapshot.forEach((docSnap) => {

        const user = docSnap.data();

        userList.innerHTML += `

        <div class="user-card">

            <strong>${user.displayName}</strong><br>

            <small>${user.email}</small><br>

            <small><b>Rol:</b> ${user.role}</small>

            <hr>

            <label>
                <input
                    type="radio"
                    name="sourceUser"
                    value="${docSnap.id}">
                Kaynak
            </label>

            <br>

            <label>
                <input
                    type="radio"
                    name="targetUser"
                    value="${docSnap.id}">
                Hedef
            </label>

        </div>

        `;

    });

    document.querySelectorAll("input[name='sourceUser']").forEach(radio => {

        radio.addEventListener("change", () => {

            sourceUid = radio.value;

            console.log("Kaynak:", sourceUid);
        loadProgramPreview(sourceUid);

        });

    });

    document.querySelectorAll("input[name='targetUser']").forEach(radio => {

        radio.addEventListener("change", () => {

            targetUid = radio.value;

            console.log("Hedef:", targetUid);

        });

    });

}
// ===============================
// Programı Oku
// ===============================

async function loadProgram(uid, name) {

    const programContainer = document.getElementById("programContainer");

    programContainer.innerHTML = "Program yükleniyor...";

    const ref = doc(
        db,
        "users",
        uid,
        "programlar",
        "anaProgram"
    );

    const snap = await getDoc(ref);

    if (!snap.exists()) {

        programContainer.innerHTML = `
            <h2>${name}</h2>
            <p>Bu kullanıcıya ait program bulunamadı.</p>
        `;

        return;

    }

    const data = JSON.parse(snap.data().data);

    let html = `<h2>${name}</h2>`;

    data.forEach((week, weekIndex) => {

        html += `
            <div class="week-box">

                <h3>${weekIndex + 1}. HAFTA</h3>

                <p>
                    <strong>Hafta Notu:</strong>
                    ${week.note || "-"}
                </p>
        `;

const days = [
    "PAZARTESİ",
    "SALI",
    "ÇARŞAMBA",
    "PERŞEMBE",
    "CUMA",
    "CUMARTESİ",
    "PAZAR"
];

week.lessons.forEach((day, dayIndex) => {

    html += `
        <div class="day-box">

            <h4>${days[dayIndex]}</h4>
    `;

    day.forEach((lesson, lessonIndex) => {

        html += `

            <div class="lesson-box">

                <strong>${lessonIndex+1}. Ders</strong><br>

                <b>Ders:</b>
                ${lesson.lesson || "-"}

                <br>

                <b>Tür:</b>
                ${lesson.type || "-"}

                <br>

                <b>Not:</b>
                ${lesson.note || "-"}

            </div>

        `;

    });

    html += `</div>`;

});

        html += `</div>`;

    });

    programContainer.innerHTML = html;

}
document.getElementById("copyProgramBtn").addEventListener("click", async () => {

    if (!sourceUid || !targetUid) {
        alert("Lütfen kaynak ve hedef kullanıcı seçiniz.");
        return;
    }

    if (sourceUid === targetUid) {
        alert("Kaynak ve hedef aynı kullanıcı olamaz.");
        return;
    }

    const sourceRef = doc(
        db,
        "users",
        sourceUid,
        "programlar",
        "anaProgram"
    );

    const targetRef = doc(
        db,
        "users",
        targetUid,
        "programlar",
        "anaProgram"
    );

    const sourceSnap = await getDoc(sourceRef);

    if (!sourceSnap.exists()) {
        alert("Kaynak kullanıcıda program bulunamadı.");
        return;
    }

    await setDoc(targetRef, sourceSnap.data());

    alert("✅ Program başarıyla kopyalandı.");

});
async function loadProgramPreview(uid) {



    const userSnap = await getDoc(doc(db, "users", uid));

    const programSnap = await getDoc(
        doc(db, "users", uid, "programlar", "anaProgram")
    );

    if (!programSnap.exists()) {

        container.innerHTML = "<p>Bu kullanıcıda program bulunamadı.</p>";

        return;

    }

    previewUser = userSnap.data();

    previewData = JSON.parse(programSnap.data().data);

    previewWeek = 0;

    renderPreview();

    return;

}

function renderPreview() {

    const header = document.getElementById("previewHeader");
    const weeks = document.getElementById("previewWeeks");
    const content = document.getElementById("previewContent");

    if (!header || !weeks || !content) {
    console.error("Preview alanları bulunamadı.");
    return;
}

    weeks.innerHTML = "";
    content.innerHTML = "";

    header.innerHTML = `
        <h2>${previewUser.displayName}</h2>

        <p>Mail : ${previewUser.email}</p>

        <p>Rol : ${previewUser.role}</p>
    `;
const currentWeek = previewData[previewWeek];

if (!currentWeek) {
    content.innerHTML = "<p>Hafta bulunamadı.</p>";
    return;
}

content.innerHTML = `<h3>${previewWeek + 1}. Hafta</h3>`;
console.log(currentWeek);
content.innerHTML += `
    <p><b>Hafta Notu:</b> ${currentWeek.note || "-"}</p>
    <hr>
`;
const weekDays = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar"
];
currentWeek.lessons.forEach((lessonList, dayIndex) => {

    content.innerHTML += `
        <div class="lessonCard">
            <h3>${weekDays[dayIndex]}</h3>
    `;

    lessonList.forEach((lesson, lessonIndex) => {

        content.innerHTML += `
            <div class="lessonItem">

                <b>${lessonIndex + 1}. Konu</b><br>

                Ders : ${lesson.lesson || "-"}<br>

                Tür : ${lesson.type || "-"}<br>

                Not : ${lesson.note || "-"}<br>

                Durum :
                ${lesson.done ? "✅ Tamamlandı" : "⬜ Tamamlanmadı"}

                <hr>

            </div>
        `;

    });

    content.innerHTML += `</div>`;

});
previewData.forEach((week, index) => {

    const btn = document.createElement("button");

    btn.textContent = `${index + 1}. Hafta`;

    btn.className = "previewWeek";

    if (index === previewWeek) {
        btn.classList.add("active");
    }

    btn.onclick = () => {
        previewWeek = index;
        renderPreview();
    };

    weeks.appendChild(btn);

});

}
