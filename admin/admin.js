// ============================================================
// GFS ADMIN PORTAL
// Login + Dashboard + Logout + Articles Navigation
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ============================================================
    // CHECK SUPABASE
    // ============================================================

    if (!window.supabaseClient) {
        console.error("Supabase client is not available.");

        const message = document.getElementById("loginMessage");

        if (message) {
            message.textContent = "Supabase connection is not available.";
            message.style.color = "#c62828";
        }

        return;
    }


    // ============================================================
    // LOGIN PAGE
    // ============================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        try {

            // Check existing session
            const {
                data: sessionData,
                error: sessionError
            } = await window.supabaseClient.auth.getSession();

            if (sessionError) {
                console.error("Session check error:", sessionError);
            }

            if (sessionData && sessionData.session) {
                console.log("Existing session found.");
                window.location.replace("/admin/dashboard.html");
                return;
            }

        } catch (error) {
            console.error("Error checking session:", error);
        }


        // ------------------------------------------------------------
        // LOGIN FORM SUBMISSION
        // ------------------------------------------------------------

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            const loginButton = document.getElementById("loginButton");
            const loginMessage = document.getElementById("loginMessage");

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";


            // Validate fields
            if (!email || !password) {

                if (loginMessage) {
                    loginMessage.textContent =
                        "Please enter your email and password.";
                    loginMessage.style.color = "#c62828";
                }

                return;
            }


            // Disable button
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";
            }


            if (loginMessage) {
                loginMessage.textContent = "Signing in...";
                loginMessage.style.color = "#f28c28";
            }


            try {

                console.log("Attempting Supabase login...");


                // ----------------------------------------------------
                // SUPABASE LOGIN
                // ----------------------------------------------------

                const {
                    data,
                    error
                } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


                // ----------------------------------------------------
                // LOGIN ERROR
                // ----------------------------------------------------

                if (error) {

                    console.error("Supabase login error:", error);

                    if (loginMessage) {
                        loginMessage.textContent = error.message;
                        loginMessage.style.color = "#c62828";
                    }

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = "Sign In";
                    }

                    return;
                }


                // ----------------------------------------------------
                // CHECK SESSION
                // ----------------------------------------------------

                if (!data || !data.session) {

                    console.error("No session returned from Supabase.");

                    if (loginMessage) {
                        loginMessage.textContent =
                            "Login failed. No active session was created.";
                        loginMessage.style.color = "#c62828";
                    }

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = "Sign In";
                    }

                    return;
                }


                // ----------------------------------------------------
                // LOGIN SUCCESS
                // ----------------------------------------------------

                console.log("Login successful.");
                console.log("Logged in user:", data.user.email);


                if (loginMessage) {
                    loginMessage.textContent =
                        "Login successful. Opening dashboard...";
                    loginMessage.style.color = "#f28c28";
                }


                // ----------------------------------------------------
                // REDIRECT TO DASHBOARD
                // ----------------------------------------------------

                setTimeout(function () {
                    window.location.replace("/admin/dashboard.html");
                }, 500);

            } catch (error) {

                console.error("Unexpected login error:", error);

                if (loginMessage) {
                    loginMessage.textContent =
                        error.message ||
                        "An unexpected error occurred.";
                    loginMessage.style.color = "#c62828";
                }

                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Sign In";
                }
            }

        });
    }


    // ============================================================
    // DASHBOARD PAGE
    // ============================================================

    const dashboardPage =
        document.getElementById("dashboardPage");

    if (dashboardPage) {

        try {

            const {
                data,
                error
            } = await window.supabaseClient.auth.getSession();


            // Session error
            if (error) {

                console.error("Dashboard session error:", error);

                window.location.replace("/admin/");
                return;
            }


            // No session
            if (!data || !data.session) {

                console.log(
                    "No active session. Returning to login."
                );

                window.location.replace("/admin/");
                return;
            }


            // Session exists
            console.log("Dashboard session active.");
            console.log(
                "Logged in as:",
                data.session.user.email
            );

        } catch (error) {

            console.error(
                "Unexpected dashboard error:",
                error
            );

            window.location.replace("/admin/");
            return;
        }
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                logoutButton.disabled = true;
                logoutButton.textContent = "Signing out...";

                try {

                    const { error } =
                        await window.supabaseClient.auth.signOut();


                    if (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        logoutButton.disabled = false;
                        logoutButton.textContent = "Logout";

                        return;
                    }


                    // Return to login
                    window.location.replace("/admin/");

                } catch (error) {

                    console.error(
                        "Unexpected logout error:",
                        error
                    );

                    window.location.replace("/admin/");
                }

            }
        );
    }


    // ============================================================
    // MANAGE ARTICLES BUTTON
    // ============================================================

    const articlesButton =
        document.getElementById("articlesButton");

    if (articlesButton) {

        articlesButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/admin/articles.html";

            }
        );
    }


    // ============================================================
    // END
    // ============================================================

    console.log("GFS Admin JavaScript loaded successfully.");

});

