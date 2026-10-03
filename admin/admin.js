```javascript
// ============================================================
// GFS ADMIN PORTAL
// Login + Dashboard + Logout
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ------------------------------------------------------------
    // Check Supabase client
    // ------------------------------------------------------------

    if (!window.supabaseClient) {
        console.error("Supabase client is not available.");
        showMessage("Supabase connection is not available.", true);
        return;
    }

    // ------------------------------------------------------------
    // LOGIN PAGE
    // ------------------------------------------------------------

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        // Check whether user is already logged in
        const {
            data: { session }
        } = await window.supabaseClient.auth.getSession();

        if (session) {
            window.location.replace("/admin/dashboard.html");
            return;
        }

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const emailElement = document.getElementById("email");
            const passwordElement = document.getElementById("password");
            const loginButton = document.getElementById("loginButton");

            const email = emailElement ? emailElement.value.trim() : "";
            const password = passwordElement ? passwordElement.value : "";

            if (!email || !password) {
                showMessage("Please enter your email and password.", true);
                return;
            }

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";
            }

            showMessage("Signing in...");

            try {

                const { data, error } =
                    await window.supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                if (error) {
                    console.error("Supabase login error:", error);
                    showMessage(error.message, true);

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = "Sign In";
                    }

                    return;
                }

                if (!data || !data.session) {
                    showMessage("Login failed. No active session was created.", true);

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = "Sign In";
                    }

                    return;
                }

                console.log("Login successful.");
                console.log("User:", data.user);

                showMessage("Login successful. Opening dashboard...");

                // Give Supabase a moment to save the session
                setTimeout(function () {
                    window.location.replace("/admin/dashboard.html");
                }, 500);

            } catch (error) {

                console.error("Unexpected login error:", error);
                showMessage(
                    error.message || "An unexpected error occurred.",
                    true
                );

                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Sign In";
                }
            }
        });
    }


    // ------------------------------------------------------------
    // DASHBOARD PAGE
    // ------------------------------------------------------------

    const dashboardPage = document.getElementById("dashboardPage");

    if (dashboardPage) {

        const {
            data: { session },
            error
        } = await window.supabaseClient.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            window.location.replace("/admin/");
            return;
        }

        if (!session) {
            console.log("No active session. Returning to login.");
            window.location.replace("/admin/");
            return;
        }

        console.log("Dashboard session active.");
        console.log("Logged in as:", session.user.email);
    }


    // ------------------------------------------------------------
    // LOGOUT
    // ------------------------------------------------------------

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", async function () {

            logoutButton.disabled = true;
            logoutButton.textContent = "Signing out...";

            try {

                const { error } =
                    await window.supabaseClient.auth.signOut();

                if (error) {
                    console.error("Logout error:", error);
                    showMessage(error.message, true);

                    logoutButton.disabled = false;
                    logoutButton.textContent = "Logout";
                    return;
                }

                window.location.replace("/admin/");

            } catch (error) {

                console.error("Unexpected logout error:", error);

                window.location.replace("/admin/");
            }
        });
    }


    // ------------------------------------------------------------
    // DASHBOARD ARTICLES BUTTON
    // ------------------------------------------------------------

    const articlesButton = document.getElementById("articlesButton");

    if (articlesButton) {

        articlesButton.addEventListener("click", function () {
            window.location.href = "/admin/articles.html";
        });
    }


    // ------------------------------------------------------------
    // HELPER: SHOW MESSAGE
    // ------------------------------------------------------------

    function showMessage(message, isError) {

        const messageElement =
            document.getElementById("loginMessage") ||
            document.getElementById("articleMessage");

        if (!messageElement) {
            console.log(message);
            return;
        }

        messageElement.textContent = message;

        if (isError) {
            messageElement.style.color = "#c62828";
        } else {
            messageElement.style.color = "#f28c28";
        }
    }

});
```
