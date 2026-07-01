import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {

    registerBtn.addEventListener("click", async () => {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            document.getElementById("message").textContent =
                "Kayıt başarılı!";

            console.log(userCredential.user);

        } catch (error) {

            document.getElementById("message").textContent =
                error.message;

            console.error(error);

        }

    });

}
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {

            await signInWithEmailAndPassword(auth, email, password);

            document.getElementById("message").textContent =
                "Giriş başarılı.";

            window.location.href = "index.html";

        } catch (error) {

            document.getElementById("message").textContent =
                error.message;

            console.error(error);

        }

    });

}