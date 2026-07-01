import { db, doc, getDoc, setDoc, onSnapshot } from "./firebase.js";
async function saveProgram() {
    await setDoc(doc(db,"programlar","anaProgram"),{
        data: JSON.stringify(data)
    });
}

async function loadProgram() {

    const ref = doc(db,"programlar","anaProgram");
    const snap = await getDoc(ref);

    if(snap.exists()){

        data = JSON.parse(snap.data().data);

    }else{

        await saveProgram();

    }
console.log(data);
console.log(Array.isArray(data));
    create();
    openWeek(activeWeek);
}
const days = [
    "PAZARTESİ",
    "SALI",
    "ÇARŞAMBA",
    "PERŞEMBE",
    "CUMA",
    "CUMARTESİ",
    "PAZAR"
];

let data = Array(8).fill().map(() => ({
    note: "",
    completed: false,
    lessons: Array(7).fill().map(() =>
        Array(3).fill().map(() => ({
            lesson: "",
            type: "",
            note: "",
            done: false
        }))
    )
}));

// Eski kayıtları yeni yapıya uyarla
data.forEach(week=>{

    if(week.note===undefined)
        week.note="";

    if(week.completed===undefined)
        week.completed=false;

    week.lessons.forEach(day=>{

        day.forEach(lesson=>{

            if(lesson.done===undefined)
                lesson.done=false;

        });

    });

});

let current={
w:0,
d:0,
l:0
};
let activeWeek = 0;




function create(){

    console.log("create başladı");
    console.log(data);
    console.log(typeof data);
    console.log(Array.isArray(data));

    let html="";

    data.forEach((week,w)=>{

html+=`

<div class="week ${w==0?'active':''}">


<div class="title">
${w+1}.HAFTA
</div>


<table>


<tr>

<th></th>
<th>1.DERS</th>
<th>2.DERS</th>
<th>3.DERS</th>

</tr>

`;


days.forEach((day,d)=>{


html+=`

<tr class="${data[w].lessons[d][0].done ? 'completedDay' : ''}">

<td class="day">

<input
type="checkbox"
${data[w].lessons[d][0].done ? "checked" : ""}
onchange="toggleDay(${w},${d})">

<br><br>

${day}

</td>

`;


for(let l=0;l<3;l++){


let x=data[w].lessons[d][l];


html+=`

<td class="lesson" onclick="edit(${w},${d},${l})">

<div class="lessonName">

${x.lesson || "KONU"}

</div>

<div class="lessonType ${getTypeClass(x.type)}">

${x.type || "Çalışma Türü"}

</div>

<div class="lessonNote">

${x.note || ""}

</div>

</td>

`;

}


html+=`</tr>`;

});


html+=`

</table>

</div>

`;

});


document.getElementById("weeks").innerHTML=html;

updateProgress();
}





function openWeek(i){


activeWeek = i;


document.querySelectorAll(".week")
.forEach(x=>x.classList.remove("active"));


document.querySelectorAll(".tabs button")
.forEach(x=>x.classList.remove("active"));



document.querySelectorAll(".week")[i]
.classList.add("active");


document.querySelectorAll(".tabs button")[i]
.classList.add("active");

document.getElementById("weekNote").value =
data[i].note || "";

document.getElementById("weekCompleted").checked =
data[i].completed || false;

}





function edit(w,d,l){


current={w,d,l};

document.getElementById("modalTitle").innerHTML =
days[d] + " - " + (l+1) + ". DERS";

document.getElementById("lesson").value =
data[w].lessons[d][l].lesson;

document.getElementById("type").value =
data[w].lessons[d][l].type;

document.getElementById("note").value =
data[w].lessons[d][l].note;



document.getElementById("modal").style.display="flex";


}



async function saveLesson() {

    data[current.w]
        .lessons[current.d]
        [current.l]
        .lesson =
        document.getElementById("lesson").value;

    data[current.w]
        .lessons[current.d]
        [current.l]
        .type =
        document.getElementById("type").value;

    data[current.w]
        .lessons[current.d]
        [current.l]
        .note =
        document.getElementById("note").value;

    
    await saveProgram();
        
    create();
    openWeek(activeWeek);
    closeModal();

}

function closeModal(){

    document.getElementById("modal").style.display="none";

}

window.onclick=function(e){

    if(e.target==document.getElementById("modal")){

        closeModal();

    }

}
document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeModal();

    }

});
create();
openWeek(activeWeek);

async function saveWeekNote(){

    data[activeWeek].note =
        document.getElementById("weekNote").value;

    data[activeWeek].completed =
        document.getElementById("weekCompleted").checked;

    await saveProgram();

}

async function toggleDay(w,d){

    let value = !data[w].lessons[d][0].done;

    for(let i=0;i<3;i++){
        data[w].lessons[d][i].done = value;
    }

    await saveProgram();

    create();
    openWeek(activeWeek);

}
function updateProgress(){

    let total = 56;
    let completed = 0;

    data.forEach(week=>{

        week.lessons.forEach(day=>{

            if(day[0].done)
                completed++;

        });

    });

    let percent = completed / total * 100;

    document.getElementById("progressFill").style.width =
        percent + "%";

    document.getElementById("progressText").innerHTML =
        completed + " / " + total + " Gün Tamamlandı";

}
function getTypeClass(type){

    switch(type){

        case "Konu Anlatımı":
            return "konu";

        case "Soru Çözümü":
            return "soru";

        case "Tekrar":
            return "tekrar";

        case "Deneme":
            return "deneme";

        case "Video İzleme":
            return "video";

        case "Not Çıkarma":
            return "not";

        default:
            return "";

    }

}

loadProgram();
onSnapshot(doc(db, "programlar", "anaProgram"), (snap) => {

    if (!snap.exists()) return;

    data = JSON.parse(snap.data().data);

    create();
    openWeek(activeWeek);

});
window.openWeek = openWeek;
window.edit = edit;
window.saveLesson = saveLesson;
window.closeModal = closeModal;
window.saveWeekNote = saveWeekNote;
window.toggleDay = toggleDay;