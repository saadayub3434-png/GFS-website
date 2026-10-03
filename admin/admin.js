// ============================================================
// GFS Admin Portal
// Login + Dashboard
// ============================================================


document.addEventListener("DOMContentLoaded", async function () {

    const currentPage =
        window.location.pathname.split("/").pop();


    // ========================================================
    // LOGIN PAGE
    // ========================================================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        const loginMessage =
            document.getElementById("loginMessage");

        const loginButton =
            document.getElementById("loginButton");


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const email =
                    document.getElementById("email").value.trim();

                const password =
                    document.getElementById("password").value;


                loginMessage.textContent =
                    "Signing in...";

                loginButton.disabled = true;


                try {

                    const { data, error } =
                        await window.supabaseClient.auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });


                    if (error) {
                        throw error;
                    }


                    if (!data.session) {
                        throw new Error(
                            "Login failed. No session was created."
                        );
                    }


                    loginMessage.textContent =
                        "Login successful.";


                    window.location.href =
                        "dashboard.html";


                } catch (error) {

                    console.error(
                        "GFS Login Error:",
                        error
                    );


                    loginMessage.textContent =
                        error.message ||
                        "Unable to sign in.";


                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Sign In";
                }

            }
        );
    }


    // ========================================================
    // DASHBOARD
    // ========================================================

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        const {
            data: {
                session
            }
        } = await window.supabaseClient.auth
            .getSession();


        // If not logged in, return to login
        if (!session) {

            window.location.href =
                "index.html";

            return;
        }


        // Logout
        logoutButton.addEventListener(
            "click",
            async function () {

                await window.supabaseClient.auth.signOut();

                window.location.href =
                    "index.html";

            }
        );

    }

});
