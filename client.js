console.log("Hello World!");

const form = document.querySelector("form"); // grabbing an element on the page
const loadingElement = document.querySelector(".loading");
const tweetsElement = document.querySelector(".tweets");
const API_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://localhost:5000/v2/tweet"
    : "https://ET-api.now.sh/v2/tweets";

listAllTweets();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("name");
  const content = formData.get("content");

  const tweet = {
    name,
    content
  };

  form.style.display = "none";
  loadingElement.style.display = "";

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(tweet),
    headers: {
      "content-type": "application/json"
    }
  })
    .then((response) => response.json())
    .then((createdTweet) => {
      form.reset();
      form.style.display = "";
      listAllTweets();
    });
});

function listAllTweets() {
  tweetsElement.innerHTML = "";
  fetch(API_URL)
    .then((response) => response.json())
    .then((tweets) => {
      tweets.reverse();
      tweets.forEach((tweet) => {
        const div = document.createElement("div");

        const header = document.createElement("h3");
        header.textContent = tweet.name;

        const contents = document.createElement("p");
        contents.textContent = tweet.content;

        const date = document.createElement("small");
        date.textContent = new Date(tweet.created);

        div.appendChild(header);
        div.appendChild(contents);
        div.appendChild(date);

        tweetsElement.appendChild(div);
      });
      loadingElement.style.display = "none";
    });
}
