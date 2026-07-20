import {
    auth,
    rtdb,
    ref,
    set,
    onDisconnect,
    onValue
} from "./firebase.js";


export async function startPresence() {

    const user = auth.currentUser;

    if (!user) return;

    const statusRef = ref(rtdb, "status/" + user.uid);

    await set(statusRef, {
        state: "online",
        lastChanged: Date.now()
    });

    onDisconnect(statusRef).set({
        state: "offline",
        lastChanged: Date.now()
    });

}

export function watchUserPresence(uid, callback) {

    const statusRef = ref(rtdb, "status/" + uid);

    return onValue(statusRef, (snapshot) => {

if (snapshot.exists()) {

    const data = snapshot.val();

    callback({
        online: data.state === "online",
        lastChanged: data.lastChanged
    });

} else {

    callback({
        online:false,
        lastChanged:null
    });

}

});




}