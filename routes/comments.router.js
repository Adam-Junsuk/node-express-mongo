import express from "express";
import Post from "../schemas/post.schemas.js";
import Comment from "../schemas/comments.schemas.js";

const router = express.Router();

// 댓글 생성
router.post("/posts/:_postId/comments", async (req, res) => {
  const _postId = req.params._postId;
  const { user, password, content } = req.body;

  // 입력값 검증
  if (!_postId || !user || !password || !content) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  if (content === "") {
    return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
  }

  try {
    // 게시글 조회
    const post = await Post.findById(_postId).exec();

    if (!post) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    // 댓글 생성
    const newComment = new Comment({
      user,
      password,
      content,
    });

    await newComment.save();

    // 댓글 연결

    post.comments.push(newComment._id);
    await post.save();

    return res.status(201).json({ message: "댓글을 생성하였습니다." });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 전체 게시글 조회
router.get("/posts/:_postId/comments", async (req, res) => {
  const _postId = req.params._postId;

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

//**  댓글 수정 **/
router.put("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const _postId = req.params._postId; // 게시글 ID
  const _commentId = req.params._commentId; // 댓글 ID
  const { password, content } = req.body; // 요청 바디에서 비밀번호와 내용 추출

  try {
    // 게시글과 댓글을 동시에 조회하기 위해 Promise.all 사용
    const [post, comment] = await Promise.all([
      Post.findById(_postId).exec(),
      Comment.findById(_commentId).exec(),
    ]);

    // 게시글이 존재하지 않을 경우 에러 응답
    if (!post) {
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    }

    // 댓글이 존재하지 않을 경우 에러 응답
    if (!comment) {
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
    }

    // 비밀번호가 일치하지 않을 경우 에러 응답
    if (comment.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 댓글 내용 수정
    comment.content = content;
    await comment.save();

    return res.status(200).json({ message: "댓글을 수정하였습니다." });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "서버 에러" });
  }
});

//** */ 댓글 삭제 **//
router.delete("/posts/:_postId/comments/:_commentId", async (req, res) => {
    const _postId = req.params._postId; // 게시글 ID
    const _commentId = req.params._commentId; // 댓글 ID
    const { password } = req.body; // 요청 바디에서 비밀번호 추출
  
    try {
      // 게시글과 댓글을 동시에 조회하기 위해 Promise.all 사용
      const [post, comment] = await Promise.all([
        Post.findById(_postId).exec(),
        Comment.findById(_commentId).exec(),
      ]);
  
      // 게시글이 존재하지 않을 경우 에러 응답
      if (!post) {
        return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
      }
  
      // 댓글이 존재하지 않을 경우 에러 응답
      if (!comment) {
        return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
      }
  
      // 비밀번호가 일치하지 않을 경우 에러 응답
      if (comment.password !== password) {
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
      }
  
      // 댓글 삭제
      await Comment.findByIdAndDelete(_commentId).exec();
  
      // 게시글의 댓글 배열에서 삭제된 댓글 ID 제거
      post.comments.pull(_commentId);
      await post.save();
  
      return res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      console.error(error.stack);
      res.status(500).json({ message: "서버 에러" });
    }
  });
  

export default router;
