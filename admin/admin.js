// ============================================================
// GFS ADMIN PORTAL
// Login + Dashboard + Logout + Article Management
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ============================================================
    // CHECK SUPABASE
    // ============================================================

    if (!window.supabaseClient) {
        console.error("Supabase client is not available.");
        return;
    }


    // ============================================================
    // LOGIN PAGE
    // ============================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        const {
            data: sessionData
        } = await window.supabaseClient.auth.getSession();

        if (sessionData && sessionData.session) {
            window.location.replace("/admin/dashboard.html");
            return;
        }

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            const loginButton = document.getElementById("loginButton");
            const loginMessage = document.getElementById("loginMessage");

            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!email || !password) {
                if (loginMessage) {
                    loginMessage.textContent =
                        "Please enter your email and password.";
                }
                return;
            }

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Signing in...";
            }

            try {

                const {
                    data,
                    error
                } = await window.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    console.error("Login error:", error);

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

                if (!data || !data.session) {
                    if (loginMessage) {
                        loginMessage.textContent =
                            "Login failed. No session was created.";
                    }

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent = "Sign In";
                    }

                    return;
                }

                if (loginMessage) {
                    loginMessage.textContent =
                        "Login successful. Opening dashboard...";
                    loginMessage.style.color = "#f28c28";
                }

                setTimeout(function () {
                    window.location.replace("/admin/dashboard.html");
                }, 500);

            } catch (error) {

                console.error("Unexpected login error:", error);

                if (loginMessage) {
                    loginMessage.textContent =
                        error.message || "Login failed.";
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

        const {
            data,
            error
        } = await window.supabaseClient.auth.getSession();

        if (error || !data || !data.session) {
            window.location.replace("/admin/");
            return;
        }

        console.log(
            "Dashboard logged in as:",
            data.session.user.email
        );
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

                await window.supabaseClient.auth.signOut();

                window.location.replace("/admin/");
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
    // ARTICLE MANAGER
    // ============================================================

    const articleForm =
        document.getElementById("articleForm");

    const articlesContainer =
        document.getElementById("articlesContainer");


    if (articleForm) {

        // ----------------------------------------------------------
        // CHECK LOGIN
        // ----------------------------------------------------------

        const {
            data,
            error
        } = await window.supabaseClient.auth.getSession();

        if (error || !data || !data.session) {
            window.location.replace("/admin/");
            return;
        }


        // ----------------------------------------------------------
        // FORM ELEMENTS
        // ----------------------------------------------------------

        const articleId =
            document.getElementById("articleId");

        const titleInput =
            document.getElementById("title");

        const categoryInput =
            document.getElementById("category");

        const authorInput =
            document.getElementById("author");

        const imageInput =
            document.getElementById("featuredImage");

        const excerptInput =
            document.getElementById("excerpt");

        const contentInput =
            document.getElementById("content");

        const statusInput =
            document.getElementById("status");

        const publishedAtInput =
            document.getElementById("publishedAt");

        const articleMessage =
            document.getElementById("articleMessage");

        const saveButton =
            articleForm.querySelector(
                'button[type="submit"]'
            );

        const cancelButton =
            document.getElementById("cancelArticle");


        // ----------------------------------------------------------
        // MESSAGE FUNCTION
        // ----------------------------------------------------------

        function showArticleMessage(message, error) {

            if (!articleMessage) {
                console.log(message);
                return;
            }

            articleMessage.textContent = message;

            if (error) {
                articleMessage.style.color = "#c62828";
            } else {
                articleMessage.style.color = "#f28c28";
            }
        }


        // ----------------------------------------------------------
        // CREATE SLUG
        // ----------------------------------------------------------

        function createSlug(title) {

            return title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }


        // ----------------------------------------------------------
        // CREATE UNIQUE SLUG
        // ----------------------------------------------------------

        async function createUniqueSlug(title, currentId) {

            const baseSlug = createSlug(title);

            if (!baseSlug) {
                throw new Error(
                    "Please enter a valid article title."
                );
            }

            let slug = baseSlug;
            let counter = 2;

            while (true) {

                let query =
                    window.supabaseClient
                        .from("articles")
                        .select("id")
                        .eq("slug", slug)
                        .limit(1);

                if (currentId) {
                    query = query.neq("id", currentId);
                }

                const {
                    data,
                    error
                } = await query;

                if (error) {
                    throw error;
                }

                if (!data || data.length === 0) {
                    return slug;
                }

                slug = baseSlug + "-" + counter;
                counter++;
            }
        }


        // ----------------------------------------------------------
        // LOAD ARTICLES
        // ----------------------------------------------------------

        async function loadArticles() {

            if (!articlesContainer) {
                return;
            }

            articlesContainer.innerHTML =
                "<p>Loading articles...</p>";

            try {

                const {
                    data: articles,
                    error
                } = await window.supabaseClient
                    .from("articles")
                    .select("*")
                    .order("created_at", {
                        ascending: false
                    });

                if (error) {
                    throw error;
                }

                if (!articles || articles.length === 0) {

                    articlesContainer.innerHTML =
                        "<p>No articles found.</p>";

                    return;
                }


                articlesContainer.innerHTML = "";


                articles.forEach(function (article) {

                    const card =
                        document.createElement("div");

                    card.className = "article-item";


                    const title =
                        document.createElement("h3");

                    title.textContent =
                        article.title || "Untitled";


                    const details =
                        document.createElement("p");

                    details.textContent =
                        "Category: " +
                        (article.category || "-") +
                        " | Status: " +
                        (article.status || "draft");


                    const editButton =
                        document.createElement("button");

                    editButton.type = "button";
                    editButton.textContent = "Edit";


                    const deleteButton =
                        document.createElement("button");

                    deleteButton.type = "button";
                    deleteButton.textContent = "Delete";


                    editButton.addEventListener(
                        "click",
                        function () {
                            editArticle(article);
                        }
                    );


                    deleteButton.addEventListener(
                        "click",
                        function () {
                            deleteArticle(article.id);
                        }
                    );


                    card.appendChild(title);
                    card.appendChild(details);
                    card.appendChild(editButton);
                    card.appendChild(deleteButton);

                    articlesContainer.appendChild(card);

                });

            } catch (error) {

                console.error(
                    "Load articles error:",
                    error
                );

                articlesContainer.innerHTML =
                    "<p>Unable to load articles.</p>";

            }
        }


        // ----------------------------------------------------------
        // SAVE ARTICLE
        // ----------------------------------------------------------

        articleForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";

                if (!title) {
                    showArticleMessage(
                        "Please enter an article title.",
                        true
                    );
                    return;
                }


                if (saveButton) {
                    saveButton.disabled = true;
                    saveButton.textContent = "Saving...";
                }

                showArticleMessage(
                    "Saving article..."
                );


                try {

                    const currentId =
                        articleId
                            ? articleId.value
                            : "";


                    const slug =
                        await createUniqueSlug(
                            title,
                            currentId
                        );


                    const articleData = {

                        title: title,

                        slug: slug,

                        category:
                            categoryInput
                                ? categoryInput.value
                                : "Finance",

                        author:
                            authorInput
                                ? authorInput.value.trim()
                                : "",

                        featured_image:
                            imageInput
                                ? imageInput.value.trim()
                                : "",

                        excerpt:
                            excerptInput
                                ? excerptInput.value.trim()
                                : "",

                        content:
                            contentInput
                                ? contentInput.value
                                : "",

                        status:
                            statusInput
                                ? statusInput.value
                                : "draft",

                        published_at:
                            publishedAtInput &&
                            publishedAtInput.value
                                ? new Date(
                                    publishedAtInput.value
                                  ).toISOString()
                                : null,

                        updated_at:
                            new Date().toISOString()
                    };


                    let result;


                    // ------------------------------------------------
                    // UPDATE
                    // ------------------------------------------------

                    if (currentId) {

                        result =
                            await window.supabaseClient
                                .from("articles")
                                .update(articleData)
                                .eq("id", currentId);

                    }

                    // ------------------------------------------------
                    // INSERT
                    // ------------------------------------------------

                    else {

                        result =
                            await window.supabaseClient
                                .from("articles")
                                .insert(articleData);

                    }


                    if (result.error) {
                        throw result.error;
                    }


                    showArticleMessage(
                        "Article saved successfully."
                    );


                    resetArticleForm();

                    await loadArticles();


                } catch (error) {

                    console.error(
                        "Save article error:",
                        error
                    );

                    showArticleMessage(
                        error.message ||
                        "Unable to save article.",
                        true
                    );

                } finally {

                    if (saveButton) {
                        saveButton.disabled = false;
                        saveButton.textContent = "Save Article";
                    }

                }

            }
        );


        // ----------------------------------------------------------
        // EDIT ARTICLE
        // ----------------------------------------------------------

        function editArticle(article) {

            if (articleId) {
                articleId.value = article.id || "";
            }

            if (titleInput) {
                titleInput.value =
                    article.title || "";
            }

            if (categoryInput) {
                categoryInput.value =
                    article.category || "Finance";
            }

            if (authorInput) {
                authorInput.value =
                    article.author || "";
            }

            if (imageInput) {
                imageInput.value =
                    article.featured_image || "";
            }

            if (excerptInput) {
                excerptInput.value =
                    article.excerpt || "";
            }

            if (contentInput) {
                contentInput.value =
                    article.content || "";
            }

            if (statusInput) {
                statusInput.value =
                    article.status || "draft";
            }

            if (publishedAtInput &&
                article.published_at) {

                const date =
                    new Date(article.published_at);

                const year =
                    date.getFullYear();

                const month =
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        date.getDate()
                    ).padStart(2, "0");

                const hours =
                    String(
                        date.getHours()
                    ).padStart(2, "0");

                const minutes =
                    String(
                        date.getMinutes()
                    ).padStart(2, "0");

                publishedAtInput.value =
                    year +
                    "-" +
                    month +
                    "-" +
                    day +
                    "T" +
                    hours +
                    ":" +
                    minutes;
            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        // ----------------------------------------------------------
        // DELETE ARTICLE
        // ----------------------------------------------------------

        async function deleteArticle(id) {

            if (!id) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this article?"
                );

            if (!confirmed) {
                return;
            }


            try {

                const {
                    error
                } = await window.supabaseClient
                    .from("articles")
                    .delete()
                    .eq("id", id);


                if (error) {
                    throw error;
                }


                showArticleMessage(
                    "Article deleted successfully."
                );

                await loadArticles();

            } catch (error) {

                console.error(
                    "Delete article error:",
                    error
                );

                showArticleMessage(
                    error.message ||
                    "Unable to delete article.",
                    true
                );
            }
        }


        // ----------------------------------------------------------
        // RESET FORM
        // ----------------------------------------------------------

        function resetArticleForm() {

            articleForm.reset();

            if (articleId) {
                articleId.value = "";
            }

            if (statusInput) {
                statusInput.value = "draft";
            }
        }


        // ----------------------------------------------------------
        // CANCEL
        // ----------------------------------------------------------

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function () {

                    resetArticleForm();

                    showArticleMessage("");

                }
            );
        }


        // ----------------------------------------------------------
        // REFRESH BUTTON
        // ----------------------------------------------------------

        const refreshButton =
            document.getElementById("refreshArticles");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function () {
                    loadArticles();
                }
            );
        }


        // ----------------------------------------------------------
        // INITIAL LOAD
        // ----------------------------------------------------------

        await loadArticles();

    }


    // ============================================================
    // COMPLETE
    // ============================================================

    console.log(
        "GFS Admin Portal JavaScript loaded successfully."
    );

});
