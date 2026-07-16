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
    document.getElementById("totalUsers").textContent =
    snapshot.size;
    let activeToday = 0;

let latestUser = null;
let latestDate = null;

let totalProgress = 0;
let progressUsers = 0;

    for (const docSnap of snapshot.docs) {
        const user = docSnap.data();

// Son görülme kontrolü
if (user.lastSeen) {

    const lastSeen = user.lastSeen.toDate();

    const today = new Date();

    if (
        lastSeen.getDate() === today.getDate() &&
        lastSeen.getMonth() === today.getMonth() &&
        lastSeen.getFullYear() === today.getFullYear()
    ) {
        activeToday++;
    }

    if (!latestDate || lastSeen > latestDate) {
        latestDate = lastSeen;
        latestUser = user;
    }
    const programSnap = await getDoc(
    doc(db, "users", docSnap.id, "programlar", "anaProgram")
);

if (programSnap.exists()) {

    const programData = JSON.parse(programSnap.data().data);

    let completedDays = 0;

    programData.forEach(week => {

        week.lessons.forEach(day => {

            if (day.every(x => x.done)) {
                completedDays++;
            }

        });

    });

    const progress = Math.round((completedDays / 56) * 100);

    totalProgress += progress;
    progressUsers++;

}

}


        userList.innerHTML += `

        <div class="user-card">

            <strong>${user.displayName}</strong><br>

            <small>${user.email}</small><br>

            <small><b>Rol:</b> ${user.role}</small>
            <br><br>

<button
    class="viewProgramBtn"
    data-uid="${docSnap.id}">
    👁 Programı Gör
</button>

<hr>

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

    };
    document.getElementById("activeToday").textContent =
    activeToday;
    if (progressUsers > 0) {

    document.getElementById("avgProgress").textContent =
        "%" + Math.round(totalProgress / progressUsers);

}

if (latestUser) {

    document.getElementById("lastLogin").textContent =
        latestUser.displayName;

}
document.querySelectorAll(".viewProgramBtn").forEach(btn => {

    btn.addEventListener("click", () => {

        loadProgramPreview(btn.dataset.uid);

    });

});
    document.querySelectorAll("input[name='sourceUser']").forEach(radio => {

        radio.addEventListener("change", () => {

            sourceUid = radio.value;

            console.log("Kaynak:", sourceUid);
        

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

       const content = document.getElementById("previewContent");
content.innerHTML = "<p>Bu kullanıcıda program bulunamadı.</p>";

        return;

    }

    previewUser = userSnap.data();

    previewData = JSON.parse(programSnap.data().data);

    previewWeek = 0;

    renderPreview();

    return;

}

function renderPreview() {

    const weeks = document.getElementById("previewWeeks");
    const content = document.getElementById("previewContent");

if (!weeks || !content) {
    console.error("Preview alanları bulunamadı.");
    return;
}


    weeks.innerHTML = "";
    content.innerHTML = "";

document.getElementById("previewName").textContent =
    previewUser.displayName || "-";

document.getElementById("previewMail").textContent =
    previewUser.email || "-";

document.getElementById("previewRole").textContent =
    previewUser.role || "-";
    if (previewUser.lastSeen) {

    const date = previewUser.lastSeen.toDate();

    document.getElementById("previewLastSeen").textContent =
        date.toLocaleString("tr-TR");

} else {

    document.getElementById("previewLastSeen").textContent =
        "Hiç giriş yapmadı";

}
let completedLessons = 0;
let totalLessons = 0;

let completedDays = 0;
let totalDays = 0;

previewData.forEach(week => {

    week.lessons.forEach(day => {

        totalDays++;

        if (day.every(x => x.done)) {
            completedDays++;
        }

        day.forEach(lesson => {

            totalLessons++;

            if (lesson.done) {
                completedLessons++;
            }

        });

    });

});
const lessonPercent =
    Math.round((completedLessons / totalLessons) * 100);

const dayPercent =
    Math.round((completedDays / totalDays) * 100);
    document.getElementById("previewProgressFill").style.width =
    lessonPercent + "%";

document.getElementById("previewProgressText").textContent =
    `${completedLessons} / ${totalLessons} Ders`;

document.getElementById("previewDayProgressFill").style.width =
    dayPercent + "%";

document.getElementById("previewDayProgressText").textContent =
    `${completedDays} / ${totalDays} Gün`;
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
