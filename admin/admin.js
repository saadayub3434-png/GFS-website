```javascript
// ============================================================
// GFS ADMIN SYSTEM
// Login + Dashboard + Article Manager
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    // ========================================================
    // COMMON
    // ========================================================

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not available.");
        return;
    }


    // ========================================================
    // LOGIN PAGE
    // ========================================================

    const loginForm = document.getElementById("loginForm");

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

                    const {
                        data,
                        error
                    } = await supabase.auth
                        .signInWithPassword({
                            email,
                            password
                        });


                    if (error) {
                        throw error;
                    }


                    if (!data.session) {
                        throw new Error("Login failed.");
                    }


                    window.location.href =
                        "dashboard.html";


                } catch (error) {

                    console.error(error);

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
    // DASHBOARD
    // ========================================================

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        const {
            data: {
                session
            }
        } = await supabase.auth.getSession();


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
        document.getElementById(
            "dashboardButton"
        );


    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    // ========================================================
    // ARTICLE MANAGER
    // ========================================================

    const articleForm =
        document.getElementById(
            "articleForm"
        );


    if (!articleForm) {
        return;
    }


    // --------------------------------------------------------
    // Verify Login
    // --------------------------------------------------------

    const {
        data: {
            session
        }
    } = await supabase.auth.getSession();


    if (!session) {

        window.location.href =
            "index.html";

        return;

    }


    // --------------------------------------------------------
    // Elements
    // --------------------------------------------------------

    const articleEditor =
        document.getElementById(
            "articleEditor"
        );

    const newArticleButton =
        document.getElementById(
            "newArticleButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelButton"
        );

    const refreshButton =
        document.getElementById(
            "refreshButton"
        );

    const articlesContainer =
        document.getElementById(
            "articlesContainer"
        );

    const articleMessage =
        document.getElementById(
            "articleMessage"
        );


    // --------------------------------------------------------
    // New Article
    // --------------------------------------------------------

    newArticleButton.addEventListener(
        "click",
        function () {

            articleForm.reset();

            document.getElementById(
                "articleId"
            ).value = "";


            document.getElementById(
                "editorTitle"
            ).textContent =
                "Create New Article";


            articleEditor.style.display =
                "block";


            articleMessage.textContent =
                "";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    // --------------------------------------------------------
    // Cancel
    // --------------------------------------------------------

    cancelButton.addEventListener(
        "click",
        function () {

            articleForm.reset();

            document.getElementById(
                "articleId"
            ).value = "";


            articleEditor.style.display =
                "none";


            articleMessage.textContent =
                "";

        }
    );


    // --------------------------------------------------------
    // Create / Update Article
    // --------------------------------------------------------

    articleForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            articleMessage.textContent =
                "Saving article...";


            const id =
                document.getElementById(
                    "articleId"
                ).value;


            const title =
                document.getElementById(
                    "title"
                ).value.trim();


            const category =
                document.getElementById(
                    "category"
                ).value;


            const author =
                document.getElementById(
                    "author"
                ).value.trim();


            const excerpt =
                document.getElementById(
                    "excerpt"
                ).value.trim();


            const content =
                document.getElementById(
                    "content"
                ).value.trim();


            const featured_image =
                document.getElementById(
                    "featuredImage"
                ).value.trim();


            const status =
                document.getElementById(
                    "status"
                ).value;


            const publishedAt =
                document.getElementById(
                    "publishedAt"
                ).value;


            // ------------------------------------------------
            // Basic validation
            // ------------------------------------------------

            if (!title) {

                articleMessage.textContent =
                    "Please enter an article title.";

                return;

            }


            if (!category) {

                articleMessage.textContent =
                    "Please select a category.";

                return;

            }


            if (!content) {

                articleMessage.textContent =
                    "Please enter article content.";

                return;

            }


            // ------------------------------------------------
            // Create a unique slug
            // ------------------------------------------------

            let slug;


            if (id) {

                // ------------------------------------------------
                // Editing an existing article
                // Keep the current slug unless the title has
                // changed enough to create a new slug.
                // ------------------------------------------------

                const {
                    data: existingArticle,
                    error: existingError
                } = await supabase
                    .from("articles")
                    .select("slug, title")
                    .eq("id", id)
                    .single();


                if (existingError) {

                    console.error(existingError);

                    articleMessage.textContent =
                        "Unable to retrieve existing article.";

                    return;

                }


                const newBaseSlug =
                    createSlug(title);


                if (
                    existingArticle &&
                    existingArticle.title === title &&
                    existingArticle.slug
                ) {

                    // Title hasn't changed.
                    // Keep the original URL.
                    slug =
                        existingArticle.slug;

                } else {

                    // Title changed.
                    // Generate a new unique slug.
                    slug =
                        await generateUniqueSlug(
                            newBaseSlug,
                            id
                        );

                }


            } else {

                // New article
                const baseSlug =
                    createSlug(title);


                slug =
                    await generateUniqueSlug(
                        baseSlug
                    );

            }


            // ------------------------------------------------
            // Article Data
            // ------------------------------------------------

            const articleData = {

                title,

                slug,

                category,

                author:
                    author || null,

                excerpt:
                    excerpt || null,

                content,

                featured_image:
                    featured_image || null,

                status,

                published_at:
                    publishedAt
                        ? new Date(
                            publishedAt
                        ).toISOString()

                        : status === "published"

                            ? new Date().toISOString()

                            : null

            };


            // ------------------------------------------------
            // Save
            // ------------------------------------------------

            try {

                let result;


                if (id) {

                    result =
                        await supabase
                            .from("articles")
                            .update(articleData)
                            .eq("id", id);


                } else {

                    result =
                        await supabase
                            .from("articles")
                            .insert([
                                articleData
                            ]);

                }


                if (result.error) {
                    throw result.error;
                }


                articleMessage.textContent =
                    "Article saved successfully.";


                articleForm.reset();


                document.getElementById(
                    "articleId"
                ).value = "";


                articleEditor.style.display =
                    "none";


                await loadArticles();


            } catch (error) {

                console.error(error);


                articleMessage.textContent =
                    error.message ||
                    "Unable to save article.";

            }

        }
    );


    // ========================================================
    // Generate Unique Slug
    // ========================================================

    async function generateUniqueSlug(
        baseSlug,
        excludeId = null
    ) {

        if (!baseSlug) {

            baseSlug =
                "article";

        }


        let slug =
            baseSlug;

        let counter =
            1;


        while (true) {

            let query =
                supabase
                    .from("articles")
                    .select("id")
                    .eq("slug", slug)
                    .limit(1);


            const {
                data,
                error
            } = await query;


            if (error) {

                console.error(
                    "Slug check error:",
                    error
                );

                throw error;

            }


            // No article with this slug
            if (!data || data.length === 0) {
                return slug;
            }


            // Existing article is the same article
            if (
                excludeId &&
                data[0].id === excludeId
            ) {

                return slug;

            }


            counter++;


            slug =
                `${baseSlug}-${counter}`;

        }

    }


    // ========================================================
    // Load Articles
    // ========================================================

    async function loadArticles() {

        articlesContainer.innerHTML =
            "<p>Loading articles...</p>";


        const {
            data,
            error
        } = await supabase
            .from("articles")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(error);


            articlesContainer.innerHTML =
                "<p>Unable to load articles.</p>";

            return;

        }


        if (!data || data.length === 0) {

            articlesContainer.innerHTML =
                "<p>No articles created yet.</p>";

            return;

        }


        articlesContainer.innerHTML =
            data.map(article => `

                <div class="article-row">

                    <div>

                        <h3>
                            ${escapeHtml(
                                article.title
                            )}
                        </h3>

                        <p>

                            ${escapeHtml(
                                article.category || ""
                            )}

                            ·

                            ${escapeHtml(
                                article.status || ""
                            )}

                        </p>

                    </div>


                    <div class="article-actions">

                        <button
                            class="edit-button"
                            data-id="${article.id}"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-button"
                            data-id="${article.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `).join("");


        // ----------------------------------------------------
        // Edit buttons
        // ----------------------------------------------------

        document
            .querySelectorAll(".edit-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const article =
                            data.find(
                                item =>
                                    item.id ===
                                    button.dataset.id
                            );


                        if (article) {

                            editArticle(
                                article
                            );

                        }

                    }
                );

            });


        // ----------------------------------------------------
        // Delete buttons
        // ----------------------------------------------------

        document
            .querySelectorAll(".delete-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteArticle(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    // ========================================================
    // Edit Article
    // ========================================================

    function editArticle(article) {

        document.getElementById(
            "articleId"
        ).value =
            article.id;


        document.getElementById(
            "title"
        ).value =
            article.title || "";


        document.getElementById(
            "category"
        ).value =
            article.category || "";


        document.getElementById(
            "author"
        ).value =
            article.author || "";


        document.getElementById(
            "excerpt"
        ).value =
            article.excerpt || "";


        document.getElementById(
            "content"
        ).value =
            article.content || "";


        document.getElementById(
            "featuredImage"
        ).value =
            article.featured_image || "";


        document.getElementById(
            "status"
        ).value =
            article.status || "draft";


        document.getElementById(
            "publishedAt"
        ).value = "";


        if (article.published_at) {

            const date =
                new Date(
                    article.published_at
                );


            const localDate =
                new Date(
                    date.getTime()
                    -
                    date.getTimezoneOffset()
                    * 60000
                )
                .toISOString()
                .slice(0, 16);


            document.getElementById(
                "publishedAt"
            ).value =
                localDate;

        }


        document.getElementById(
            "editorTitle"
        ).textContent =
            "Edit Article";


        articleMessage.textContent =
            "";


        articleEditor.style.display =
            "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // ========================================================
    // Delete Article
    // ========================================================

    async function deleteArticle(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this article?"
            );


        if (!confirmed) {
            return;
        }


        const {
            error
        } = await supabase
            .from("articles")
            .delete()
            .eq("id", id);


        if (error) {

            alert(
                error.message ||
                "Unable to delete article."
            );

            return;

        }


        await loadArticles();

    }


    // ========================================================
    // Refresh
    // ========================================================

    refreshButton.addEventListener(
        "click",
        loadArticles
    );


    // ========================================================
    // Initial Load
    // ========================================================

    articleEditor.style.display =
        "none";


    await loadArticles();

});


// ============================================================
// Helper Functions
// ============================================================

function createSlug(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            "");

}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text || "";

    return div.innerHTML;

}
```
