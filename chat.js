import {
    db,
    auth,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    setDoc,
    onAuthStateChanged,
    onSnapshot,
    orderBy
} from "./firebase.js";
const tabs = document.querySelectorAll(".chatTab");

const pages = document.querySelectorAll(".chatPage");
let activeChatId = null;
let unreadCount = 0;
const chatWindow = document.getElementById("chatWindow");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(t => t.classList.remove("active"));

        pages.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");

        const page = document.getElementById(
            tab.dataset.tab + "Tab"
        );

        if(page){

            page.classList.add("active");

        }

    });

});
const searchBtn = document.getElementById("searchFriendBtn");
const searchInput = document.getElementById("friendSearch");
const resultBox = document.getElementById("friendSearchResults");

if (searchBtn) {

    searchBtn.addEventListener("click", searchUsers);

}
async function searchUsers() {

    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {

        resultBox.innerHTML = "Lütfen bir isim girin.";

        return;

    }

    resultBox.innerHTML = "Aranıyor...";

    const snapshot = await getDocs(collection(db, "users"));

    let html = "";

    snapshot.forEach(docSnap => {

        const user = docSnap.data();

        if (
            user.displayName &&
            user.displayName.toLowerCase().includes(keyword)
        ) {

            html += `
                <div class="searchUser">

                    <strong>${user.displayName}</strong><br>

                    <small>${user.email}</small><br>

                  <button
    class="addFriendBtn"
    data-uid="${docSnap.id}">
    ➕ Arkadaş Ekle
</button>

                    <hr>

                </div>
            `;

        }

    });

    if (html === "") {

        html = "Kullanıcı bulunamadı.";

    }

    resultBox.innerHTML = html;
    
    document.querySelectorAll(".addFriendBtn").forEach(btn => {

    btn.addEventListener("click", () => {

        sendFriendRequest(btn.dataset.uid);

    });

});

}
async function sendFriendRequest(targetUid) {

    const currentUser = auth.currentUser;

    if (!currentUser) return;

    if (currentUser.uid === targetUid) {

        alert("Kendinize arkadaşlık isteği gönderemezsiniz.");

        return;

    }


    try {

        await addDoc(collection(db, "friendRequests"), {

            fromUid: currentUser.uid,

            toUid: targetUid,

            status: "pending",

            createdAt: serverTimestamp()

        });

        alert("✅ Arkadaşlık isteği gönderildi.");

    } catch (error) {

        console.error(error);

        alert("❌ İstek gönderilemedi.");

    }

}

async function loadFriendRequests(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;


    const friendList = document.getElementById("friendRequests");


    const q = query(
        collection(db,"friendRequests"),
        where("toUid","==",currentUser.uid),
        where("status","==","pending")
    );


    const snapshot = await getDocs(q);


    if(snapshot.empty){

        friendList.innerHTML =
        "Bekleyen arkadaşlık isteği yok.";

        return;

    }


    let html = "<h4>Gelen İstekler</h4>";


    for(const item of snapshot.docs){

        const request = item.data();


        const userDoc = await getDoc(
            doc(db,"users",request.fromUid)
        );


        if(userDoc.exists()){

            const user = userDoc.data();


            html += `

            <div class="friendRequest">

                <b>${user.displayName}</b>

                <br>

                <button 
                class="acceptFriend"
                data-id="${item.id}"
                data-user="${request.fromUid}">

                Kabul Et

                </button>

            </div>

            <hr>

            `;

        }

    }


    friendList.innerHTML = html;


    document.querySelectorAll(".acceptFriend")
    .forEach(btn=>{


        btn.addEventListener("click",()=>{


            acceptFriend(
                btn.dataset.id,
                btn.dataset.user
            );


        });


    });

}
async function acceptFriend(requestId, friendUid){

    const currentUser = auth.currentUser;

    if(!currentUser) return;


    try {

        await addDoc(collection(db,"friends"),{

            users:[
                currentUser.uid,
                friendUid
            ],

            createdAt: serverTimestamp()

        });


        await updateDoc(
            doc(db,"friendRequests",requestId),
            {
                status:"accepted"
            }
        );


        alert("✅ Arkadaş eklendi.");


        // ekranı güncelle
        await loadFriendRequests();
        await loadFriends();


    } catch(error){

        console.error(error);

        alert("❌ Arkadaş eklenemedi.");

    }

}
async function loadFriends(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;


    const friendList = document.getElementById("friendList");


    const q = query(
        collection(db,"friends"),
        where(
            "users",
            "array-contains",
            currentUser.uid
        )
    );


    const snap = await getDocs(q);


    console.log("ARKADAŞ KAYIT SAYISI:", snap.size);


    let friendIds = [];


    snap.forEach(docSnap=>{

        const data = docSnap.data();

        console.log("ARKADAŞ DATA:", data);


        const friendUid = data.users.find(
            uid => uid !== currentUser.uid
        );


        if(friendUid){

            friendIds.push(friendUid);

        }

    });


    console.log("FRIEND IDS:", friendIds);



    if(friendIds.length === 0){

        friendList.innerHTML =
        "Henüz arkadaşınız yok.";

        return;

    }



    let html = "<h4>Arkadaşlarım</h4>";



    for(const uid of friendIds){


        const userSnap = await getDoc(
            doc(db,"users",uid)
        );


        if(userSnap.exists()){

            const user = userSnap.data();


            html += `

            <div class="friendItem">

                <span 
                class="friendName"
                data-uid="${uid}">
                
                👤 ${user.displayName}

                </span>


                <button
                class="deleteFriendBtn"
                data-uid="${uid}">
                
                🗑

                </button>

            </div>

            `;

        }

    }



    friendList.innerHTML = html;



    document.querySelectorAll(".friendName")
    .forEach(item=>{

        item.addEventListener("click",()=>{

            openChat(item.dataset.uid);

        });

    });



    document.querySelectorAll(".deleteFriendBtn")
    .forEach(btn=>{


        btn.addEventListener("click",(e)=>{

            e.stopPropagation();

            deleteFriend(btn.dataset.uid);

        });


    });


}
async function deleteFriend(friendUid){

    const currentUser = auth.currentUser;

    if(!currentUser) return;

    if(!confirm("Bu arkadaş silinsin mi?")) return;


    const q = query(
        collection(db,"friends"),
        where(
            "users",
            "array-contains",
            currentUser.uid
        )
    );


    const snap = await getDocs(q);


    console.log("SİLME İÇİN ARKADAŞLAR:", snap.size);


    for(const item of snap.docs){

        const data = item.data();

        console.log("KONTROL:", data);


        if(data.users.includes(friendUid)){

            await deleteDoc(item.ref);

        }

    }


    loadFriends();
    loadConversations();

}
async function openChat(uid){


    const currentUser = auth.currentUser;

    if(!currentUser) return;
    console.log("openChat çalıştı");
console.log("currentUser:", currentUser.uid);
console.log("friendUid:", uid);


    const chatId = createChatId(
        currentUser.uid,
        uid
    );
console.log("chatId:", chatId);

    activeChatId = chatId;
    unreadCount = 0;

updateChatBadge(0);


const chatRef = doc(
    db,
    "chats",
    chatId
);

await setDoc(
    chatRef,
    {
        users: [
            currentUser.uid,
            uid
        ],
        createdAt: serverTimestamp()
    },
    {
        merge: true
    }
);

const kontrol = await getDoc(chatRef);
console.log("Yeni chat:", kontrol.exists(), kontrol.data());



await loadConversations();



let userSnap;

try {

    userSnap = await getDoc(
        doc(db,"users",uid)
    );

}
catch(error){

    console.error("USER OKUMA HATASI:", error);

}


    if(!userSnap.exists()) return;


    const user=userSnap.data();



    document
    .querySelector('[data-tab="messages"]')
    .click();



    document.getElementById("chatUserName").innerHTML =
     user.displayName;


    await markMessagesAsRead();

document.getElementById("conversationList").style.display = "none";

document.querySelector(".chatHeaders").style.display = "flex";

document.getElementById("messageBox").style.display = "flex";

document.getElementById("messageInputArea").style.display = "flex";

loadMessages();
}
function closeChat(){

    activeChatId = null;

    document.getElementById("chatUserName").innerHTML = "";
    document.getElementById("messageBox").innerHTML = "";
    document.getElementById("messageText").value = "";

    document.querySelector(".chatHeaders").style.display = "none";
    document.getElementById("messageBox").style.display = "none";
    document.getElementById("messageInputArea").style.display = "none";
    document.getElementById("conversationList").style.display = "block";

    loadConversations(); // listeyi tekrar yükle
}


function createChatId(uid1, uid2){

    return uid1 < uid2
    ? uid1 + "_" + uid2
    : uid2 + "_" + uid1;

}
async function markMessagesAsRead(){

    if(!activeChatId) return;


    const messagesRef =
    collection(
        db,
        "chats",
        activeChatId,
        "messages"
    );


    const snapshot =
    await getDocs(messagesRef);


    for(const item of snapshot.docs){

        const msg=item.data();


     if(
    msg.sender !== auth.currentUser.uid &&
    msg.seen !== true
)
{

            await updateDoc(
                item.ref,
                {
                    seen:true
                }
            );

        }

    }

}
console.log("activeChatId:", activeChatId);
console.log(
    "Path:",
    "chats",
    activeChatId,
    "messages"
);
function loadMessages(){

    if(!activeChatId) return;


    const messagesRef = collection(
        db,
        "chats",
        activeChatId,
        "messages"
    );


    const q = query(
        messagesRef,
        orderBy("createdAt","asc")
    );

console.log("MESAJLAR DİNLENİYOR", activeChatId);
    onSnapshot(q,(snapshot)=>{

 console.log("Mesajlar başarıyla okundu.");
    let newMessages = 0;




        const box = document.getElementById("messageBox");

        let html="";


        snapshot.forEach(docSnap=>{
            const msg = docSnap.data();
            if(
    docSnap.data().sender !== auth.currentUser.uid
){
    newMessages++;
}

            


if(msg.sender === auth.currentUser.uid){

    html += `

    <div class="messageRow right">

        <div class="messageBubble myMessage">

            ${msg.text}

            <span class="time">
                ${formatTime(msg.createdAt)}
            </span>

        </div>

    </div>

    `;

}
else{


    html += `

    <div class="messageRow left">

        <div class="messageBubble otherMessage">

            ${msg.text}

            <span class="time">
                ${formatTime(msg.createdAt)}
            </span>

        </div>

    </div>

    `;


}


        });


box.innerHTML = html;


requestAnimationFrame(() => {

    const chatBody = document.getElementById("chatBody");

    if(chatBody){

        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(()=>{

            chatBody.scrollTop = chatBody.scrollHeight;

            console.log(
                "SON SCROLL:",
                chatBody.scrollTop,
                chatBody.scrollHeight,
                chatBody.clientHeight
            );

        },100);

    }

});


        if(activeChatId){
    markMessagesAsRead();
}



if(chatWindow.style.display !== "flex"){

    unreadCount = newMessages;

    updateChatBadge(unreadCount);

}


    });

}

async function sendMessage(){

    const input = document.getElementById("messageText");

    const text = input.value.trim();


    if(!text) return;


    if(!activeChatId){

        alert("Önce bir sohbet seçin.");

        return;

    }


    const messagesRef = collection(
        db,
        "chats",
        activeChatId,
        "messages"
    );


await addDoc(messagesRef,{

    sender: auth.currentUser.uid,

    text:text,

    seen:false,

    createdAt:serverTimestamp()

});
await setDoc(
    doc(db,"chats",activeChatId),
    {
        lastMessage:{
            text:text,
            sender:auth.currentUser.uid,
            time:serverTimestamp()
        }
    },
    {
        merge:true
    }
);

    input.value="";

}
const sendBtn = document.getElementById("sendMessageBtn");


if(sendBtn){

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

const messageInput =
document.getElementById("messageText");


if(messageInput){

    messageInput.addEventListener(
        "keydown",
        e=>{

            if(e.key==="Enter"){

                sendMessage();

            }

        }
    );

}
function formatTime(timestamp){

    if(!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString(
        "tr-TR",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}
function updateChatBadge(number){

    const badge =
    document.getElementById("chatBadge");


    if(!badge) return;


    if(number > 0){

        badge.style.display="inline-block";

        badge.innerHTML = number;

    }
    else{

        badge.style.display="none";

    }

}
window.updateChatBadge = updateChatBadge;
async function loadConversations(){

    const currentUser = auth.currentUser;

    if(!currentUser) return;


    const list =
    document.getElementById("conversationList");


    const q = query(
        collection(db,"chats"),
        where(
            "users",
            "array-contains",
            currentUser.uid
        )
    );


onSnapshot(q, async (snapshot)=>{


if(snapshot.empty){

    list.innerHTML =
    "Henüz sohbet yok.";

    return;

}


let html="";


    for(const chatDoc of snapshot.docs){


        const chat = chatDoc.data();


        const otherUid =
        chat.users.find(
            uid => uid !== currentUser.uid
        );


        const userSnap =
        await getDoc(
            doc(db,"users",otherUid)
        );


        if(userSnap.exists()){


            const user=userSnap.data();

console.log("MESAJ OKUMA DENEMESİ:", chatDoc.id);
const messagesSnap = await getDocs(
    query(
        collection(
            db,
            "chats",
            chatDoc.id,
            "messages"
        ),
        orderBy(
            "createdAt",
            "desc"
        )
    )
);


let lastMessage = "";
let lastTime = "";
let unread = 0;


if(!messagesSnap.empty){

    const last =
    messagesSnap.docs[0].data();
    messagesSnap.forEach(docSnap=>{

    const msg = docSnap.data();


    if(
        msg.sender !== auth.currentUser.uid &&
        msg.seen === false
    ){

        unread++;

    }

});


    lastMessage =
    last.text;


    if(last.createdAt){

        lastTime =
        formatTime(last.createdAt);

    }

}



html += `

<div 
class="conversationItem"
data-uid="${otherUid}">

<div class="conversationHeader">

<strong>
👤 ${user.displayName}
</strong>
${unread > 0 ? `<span class="unreadBadge">${unread}</span>` : ""}

<span>
${lastTime}
</span>

</div>


<div class="lastMessage">

${lastMessage || "Yeni sohbet"}

</div>


</div>

`;

        }

    }


    list.innerHTML=html;



    document
    .querySelectorAll(".conversationItem")
    .forEach(item=>{


        item.addEventListener("click",()=>{


            openChat(
                item.dataset.uid
            );


        });


    });

});
}
document.querySelector(".chatHeaders").style.display = "none";

document.getElementById("messageBox").style.display = "none";

document.getElementById("messageInputArea").style.display = "none";
onAuthStateChanged(auth,()=>{

    loadFriendRequests();

    loadFriends();

    loadConversations();

    listenUnreadMessages();

});
function listenUnreadMessages(){


const currentUser = auth.currentUser;

if(!currentUser) return;


const q=query(
    collection(db,"chats"),
    where(
        "users",
        "array-contains",
        currentUser.uid
    )
);


onSnapshot(q, async(snapshot)=>{


let totalUnread=0;


for(const chatDoc of snapshot.docs){


const messages=query(
    collection(
        db,
        "chats",
        chatDoc.id,
        "messages"
    ),
    where(
        "seen",
        "==",
        false
    )
);


const msgSnap=await getDocs(messages);



msgSnap.forEach(msg=>{


const data=msg.data();


if(data.sender !== currentUser.uid){

totalUnread++;

}


});


}


updateChatBadge(totalUnread);


});


}
const closeChatBtn =
document.getElementById("closeChatBtn");

if(closeChatBtn){

    closeChatBtn.addEventListener(
        "click",
        closeChat
    );

}
const myFriendsBtn =
document.getElementById("myFriendsBtn");


const addFriendBtn =
document.getElementById("addFriendBtn");



if(myFriendsBtn){

myFriendsBtn.onclick=()=>{

document.getElementById("myFriendsPage").style.display="block";

document.getElementById("addFriendPage").style.display="none";


};

}



if(addFriendBtn){

addFriendBtn.onclick=()=>{

document.getElementById("myFriendsPage").style.display="none";

document.getElementById("addFriendPage").style.display="block";


loadFriendRequests();


};

}