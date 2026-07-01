import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
function getErrorMessage(errorCode) {

    switch (errorCode) {

        case "auth/email-already-in-use":
            return "Bu e-posta adresi zaten kayıtlı.";

        case "auth/invalid-email":
            return "Geçerli bir e-posta adresi giriniz.";

        case "auth/user-not-found":
            return "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.";

        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "E-posta veya şifre hatalı.";

        case "auth/weak-password":
            return "Şifreniz en az 6 karakter olmalıdır.";

        case "auth/missing-password":
            return "Lütfen şifrenizi giriniz.";

        case "auth/missing-email":
            return "Lütfen e-posta adresinizi giriniz.";

        case "auth/too-many-requests":
            return "Çok fazla başarısız deneme yapıldı. Lütfen daha sonra tekrar deneyin.";

        case "auth/network-request-failed":
            return "İnternet bağlantınızı kontrol ediniz.";

        default:
            return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.";
    }

}
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
    getErrorMessage(error.code);

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
    getErrorMessage(error.code);

            console.error(error);

        }

    });

}
const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener("click", async (e) => {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            document.getElementById("message").textContent =
                "Lütfen önce e-posta adresinizi girin.";
            return;
        }

        try {

            await sendPasswordResetEmail(auth, email);

            document.getElementById("message").textContent =
                "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.";

        } catch (error) {

            document.getElementById("message").textContent =
    getErrorMessage(error.code);

        }

    });

}