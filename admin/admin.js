// ============================================================
// GFS ADMIN SYSTEM
// Login + Dashboard + Logout
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    const supabase = window.supabaseClient;

    // --------------------------------------------------------
    // Check Supabase
    // --------------------------------------------------------

    if (!supabase) {

        console.error("Supabase client not available.");

        return;
    }


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
                    document.getElementById("email")
                        .value
                        .trim();


                const password =
                    document.getElementById("password")
                        .value;


                loginMessage.textContent =
                    "Signing in...";

                loginButton.disabled = true;


                try {

                    const result =
                        await supabase.auth.signInWithPassword({
                            email: email,
                            password: password
                        });


                    if (result.error) {

                        throw result.error;

                    }


                    if (!result.data ||
                        !result.data.session) {

                        throw new Error(
                            "Login successful, but no session was created."
                        );

                    }


                    loginMessage.textContent =
                        "Login successful. Opening dashboard...";


                    // Give Supabase a moment to store the session

                    setTimeout(function () {

                        window.location.href =
                            "dashboard.html";

                    }, 300);


                } catch (error) {

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );


                    loginMessage.textContent =
                        error.message ||
                        "Unable to sign in.";


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Sign In";

                }

            }
        );

    }


    // ========================================================
    // DASHBOARD PAGE
    // ========================================================

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        const result =
            await supabase.auth.getSession();


        const session =
            result.data.session;


        if (!session) {

            window.location.href =
                "index.html";

            return;

        }


        logoutButton.addEventListener(
            "click",
            async function () {

                await supabase.auth.signOut();

                window.location.href =
                    "index.html";

            }
        );

    }


    // ========================================================
    // DASHBOARD BUTTON
    // ========================================================

    const dashboardButton =
        document.getElementById("dashboardButton");


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }

});
```
