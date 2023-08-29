// /schemas/index.js

import mongoose from "mongoose";
import dotenv from "dotenv"; // dotenv 모듈을 import합니다.

// .env 파일의 환경 변수 로드
dotenv.config();

const connect = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: "blog-prac", // 데이터베이스명을 사용합니다.
    })
    .catch((err) => console.log(err))
    .then(() => console.log("몽고디비 연결 성공"));
};

mongoose.connection.on("error", (err) => {
  console.error("몽고디비 연결 에러", err);
});

export default connect;
