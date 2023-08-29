import express from "express";
import Post from "../schemas/post.schemas.js";

const router = express.Router();

// 전체 게시글 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .select("user title createdAt")
      .sort("createdAt")
      .exec(); // 데이터베이스에서 모든 게시글을 가져옵니다.
    res.status(200).json({ data: posts });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ errorMessage: "서버 에러" });
  }
});

//** */ 세부 목록 조회  **//
router.get("/posts/:_postId", async (req, res) => {
  //Path Params 데이터 중 _postId 를 추출합니다.
  const _postId = req.params._postId;
  const post = await Post.findById(_postId).exec();
  try {
    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    return res.status(200).json({
      data: post,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 게시글 작성
router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user || !password || !title || !content) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }
  try {
    await Post.create({
      user,
      password,
      title,
      content,
    });
    return res.status(201).json({ message: "게시글을 생성하였습니다." });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 게시글 수정
router.put("/posts/:_postId", async (req, res) => {
  const _postId = req.params._postId;
  const { user, password, title, content } = req.body;

  // 입력값 검증
  if (!_postId || !user || !password || !title || !content) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    // 게시글 조회
    const post = await Post.findById(_postId).exec();

    if (!post) {
      console.error(error.stack);
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    // 비밀번호 검증
    if (post.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 게시글 수정
    post.user = user;
    post.title = title;
    post.content = content;

    await post.save();

    return res
      .status(200)
      .json({ message: "게시글이 성공적으로 수정되었습니다." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 게시글 삭제
router.delete("/posts/:_postId", async (req, res) => {
  const _postId = req.params._postId;
  const { password } = req.body;

  // 입력값 검증
  if (!_postId || !password) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    // 게시글 조회
    const post = await Post.findById(_postId).exec();

    if (!post) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    // 비밀번호 검증
    if (post.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 게시글 삭제
    await Post.findByIdAndDelete(_postId).exec();

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

export default router;
