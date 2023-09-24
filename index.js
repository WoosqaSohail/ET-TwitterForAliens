const express = require("express");
const cors = require("cors");
const monk = require("monk");
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");
const corsOptions = {
  origin: "http://localhost:your-frontend-port",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
};
const app = express();

const db = monk(process.env.MONGO_URI || "localhost/ET");
const tweets = db.get("tweets");
const filter = new Filter();

// app.enable("trust proxy");

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ETTTT! 👾"
  });
});

app.get("/tweets", (req, res) => {
  tweets.find().then((tweets) => {
    res.json(tweets);
  });
  // .catch(next);
});

// app.get("/v2/mews", (req, res, next) => {
//   // let skip = Number(req.query.skip) || 0;
//   // let limit = Number(req.query.limit) || 10;
//   let { skip = 0, limit = 5, sort = "desc" } = req.query;
//   skip = parseInt(skip) || 0;
//   limit = parseInt(limit) || 5;

//   skip = skip < 0 ? 0 : skip;
//   limit = Math.min(50, Math.max(1, limit));

//   Promise.all([
//     mews.count(),
//     mews.find(
//       {},
//       {
//         skip,
//         limit,
//         sort: {
//           created: sort === "desc" ? -1 : 1
//         }
//       }
//     )
//   ])
//     .then(([total, mews]) => {
//       res.json({
//         mews,
//         meta: {
//           total,
//           skip,
//           limit,
//           has_more: total - (skip + limit) > 0
//         }
//       });
//     })
//     .catch(next);
// });

function isValidTweet(tweet) {
  return (
    tweet.name &&
    tweet.name.toString().trim() !== "" &&
    tweet.name.toString().trim().length <= 50 &&
    tweet.content &&
    tweet.content.toString().trim() !== "" &&
    tweet.content.toString().trim().length <= 140
  );
}
app.use(
  rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 1
  })
);

// app.use(
//   rateLimit({
//     windowMs: 30 * 1000, // 30 seconds
//     max: 1
//   })
// );

app.post("/tweets", (req, res) => {
  if (isValidTweet(req.body)) {
    const tweet = {
      name: filter.clean(req.body.name.toString().trim()),
      content: filter.clean(req.body.content.toString().trim()),
      created: new Date()
    };

    tweets.insert(tweet).then((createdTweet) => {
      res.json(createdTweet);
    });
  } else {
    res.status(422);
    res.json({
      message:
        "Hey! Name and Content are required! Name cannot be longer than 50 characters. Content cannot be longer than 140 characters."
    });
  }
});

// app.post("/tweet", createMew);
app.post("/v2/mews", createMew);

app.use((error, req, res, next) => {
  res.status(500);
  res.json({
    message: error.message
  });
});

app.listen(5000, () => {
  console.log("Listening on http://localhost:5000");
});
