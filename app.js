// app.js
import express from "express";

import postsRouter from "./routes/post.router.js";
import commentsRouter from "./routes/comments.router.js";
import connect from "./schemas/index.schemas.js";


connect();
const app = express();
const PORT = 3000;

// Express에서 req.body에 접근하여, body 데이터를 사용할 수 있도록 설정하는 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes/post.js 파일은 app.js에서 라우트로 사용할 수 있게
app.use("/", [postsRouter, commentsRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
