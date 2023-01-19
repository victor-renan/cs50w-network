// CSRF Token
const csrfmiddlewaretoken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
const requestUser = document.querySelector("#request-user").value;

let pageMessage = document.querySelector("#page-message");

if (requestUser === "AnonymousUser") {
    pageMessage.innerHTML = "You must be logged in to create posts, comment and follow other users!"
    pageMessage.className = "alert alert-warning mb-3"
}

document.addEventListener("DOMContentLoaded", () => {
    // Generates all the posts in the #all-posts-view
    getAllPosts()

    // Creates a new post
    document.querySelector(".new-post__form").addEventListener("submit", (event) => {
        event.preventDefault();
        createPost();
    });
});

async function getAllPosts() {
    //Fetch the API via GET
    fetch("/api/posts")
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        posts.forEach(post => {
            // General container box
            const postBox = generateElement("div", "post rounded px-3 py-2", null);

            // -> Message
            const postMessage = document.querySelector(".post__message");

            
            // -> Header
            const postHeader = generateElement("div", "post__header d-flex align-items-center", null);

            const postUser = generateElement("h4", "post__user", post.user);
            const postFollowBtn = generateElement("button", "post__btn--follow btn btn-sm btn-link", "Follow")

            postHeader.append(postUser, postFollowBtn);
            
            // -> Body
            const postBody = generateElement("div", "post__body mb-2", null);
            
            const postContent = generateElement("pre", "post__content p-2 rounded m-0", post.content);
            const postContentEdited = generateElement("textarea", "post__content--edited form-control", post.content);

            display(postContentEdited, "none");
            
            postBody.append(postContent, postContentEdited)
            
            // -> Footer
            const postFooter = generateElement("span", "post__footer d-flex align-items-center", null);
            
            const postDate = generateElement("h6", "post__date m-0 mr-2", post.date);
            const postCommentBtn = generateElement("button", "post__btn post__btn--comment btn btn-sm btn-secondary ml-auto", "Comment");
            const postEditBtn = generateElement("button", "post__btn post__btn--edit btn btn-sm btn-secondary", "Edit");

            if (requestUser === "AnonymousUser") {
                display(postCommentBtn, "none");
                display(postEditBtn, "none");
            }

            const postSaveBtn = generateElement("button", "post__btn post__btn--save btn btn-sm btn-primary", "Save Post");

            display(postSaveBtn, "none")
            
            const postCancelBtn = generateElement("button", "post__btn post__btn--cancel btn btn-sm btn-danger", "Cancel");

            display(postCancelBtn, "none");
            
            postEditBtn.addEventListener("click", () => {
                display(postContentEdited, "block");
                display(postContent, "none");
                display(postCancelBtn, "block");
                display(postSaveBtn, "block");
                display(postDate, "none");
            })

            postCancelBtn.addEventListener("click", () => {
                display(postContentEdited, "none");
                display(postContent, "block");
                display(postCancelBtn, "none");
                display(postSaveBtn, "none");
                display(postDate, "block");
            })

            postSaveBtn.addEventListener("click", () => {
                const postContentEditedValue = postContentEdited.value.trim();
                const contentSpaces = (postContentEditedValue.match(/ /g) || []);

                if (postContentEditedValue && postContentEditedValue.length != contentSpaces.length) {
                    fetch(`/api/posts/${post.id}`, {
                        method: 'PUT',
                        headers: {'X-CSRFToken': csrfmiddlewaretoken},
                        body: JSON.stringify({
                            content: postContentEditedValue
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)

                        document.querySelector("#all-posts-view").innerHTML = '';
                        getAllPosts();

                        if (data.message) {
                            postMessage.innerHTML = data.message;
                            postMessage.className = "post__message alert alert-sm alert-success mt-2";

                        } else if (data.error) {
                            postMessage.innerHTML = data.error;
                            postMessage.className = "post__message alert alert-sm alert-danger mt-2";
                        } else {
                            postMessage.innerHTML = "";
                            postMessage.className = "post__message";
                        }


                        setTimeout(()=> {
                            postMessage.className = '';
                            postMessage.innerHTML = '';
                        }, 3000)

                    })
                    .catch((err) => console.log(err));

                } else {
                    postMessage.innerHTML = "The post can't have only spaces!";
                    postMessage.className = "new-post__message alert alert-sm alert-danger mt-2";
                }
            });

            postFooter.append(postDate, postCancelBtn, postSaveBtn, postCommentBtn, postEditBtn);

            // Appends in the general box
            postBox.append(postHeader, postBody, postFooter);
            
            //Appends in the html view
            document.querySelector("#all-posts-view").append(postBox);
        });
    })
    .catch(err => console.log(err))
}

async function createPost() {
    let newPostContent = document.querySelector(".new-post__content");
    newPostContent = newPostContent.value.trim()

    const postSpaces = (newPostContent.match(/ /g) || []);
    const newPostMessage = document.querySelector(".new-post__message");

    newPostMessage.innerHTML = "";

    if (newPostContent && newPostContent.length != postSpaces.length) {
        fetch("/api/posts/create", {
            method: 'POST',
            headers: {'X-CSRFToken': csrfmiddlewaretoken},
            body: JSON.stringify({
                content: newPostContent
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            document.querySelector("#all-posts-view").innerHTML = '';
            getAllPosts()

            newPostContent = '';
            newPostMessage.innerHTML = data.message;
            newPostMessage.className = "new-post__message alert alert-success mt-3";
        })
        .catch((err) => {
            newPostMessage.innerHTML = err;
            newPostMessage.className = "new-post__message alert alert-danger mt-3";
        });
    } else {
        newPostMessage.innerHTML = "The post can't have only spaces!";
        newPostMessage.className = "new-post__message alert alert-danger mt-3";
    }
}

function generateElement(tag, classes, text) {
    const el = document.createElement(tag);
    el.className = classes;
    el.innerHTML = text;

    return el;
}

function display(element, value) {
    element.style.display = value;
    return element;
}

console.log(requestUser)