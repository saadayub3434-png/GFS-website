// ============================================================
// GFS Admin Portal — Supabase Login
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    if (!loginForm) {
        console.error("GFS Admin: Login form not found.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            loginMessage.textContent = "Please enter your email and password.";
            return;
        }

        loginMessage.textContent = "Signing in...";
        loginButton.disabled = true;

        try {

            if (!window.supabase) {
                throw new Error(
                    "Supabase library was not loaded. Please refresh the page."
                );
            }

            if (!window.supabaseClient) {
                throw new Error(
                    "Supabase client was not initialized. Please check supabase.js."
                );
            }

            const { data, error } =
                await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            if (!data || !data.session) {
                throw new Error(
                    "Login was not completed. No session was returned."
                );
            }

            console.log("GFS Admin login successful.");

            loginMessage.textContent = "Login successful.";

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("GFS Admin Login Error:", error);

            loginMessage.textContent =
                error.message || "Unable to sign in.";

            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }

    });

});
