var express = require("express");
var router = express.Router();

const Post = require("../src/Schemas/posts.Schema");
const passport = require("passport");
const { authenticationMiddleware } = require("../auth/middleware");



router.get('/getPost/:postId', async (req, res, next) => {
  const { postId } = req.params;
  const { userId } = req.headers;
  try {
    const post = await Post.findOne({postId});
    return res
      .status(200)
      .send({ es: 0, message: "Post added successfully", postId: post._id });
  } catch (error) {
    return res.status(500).send({ es: 1, message: error });
  }
});

router.get('/recent',authenticationMiddleware(), async (req,res,next) => {
  const {limit = 10, page = 1} = req.query;
  try {
    const data = await Post.find({}, {}, {sort: {lastUpdated: -1}});
    const resData = data.slice(limit * page, limit * (page+1));
    const totalPages = data.length;
    console.log("send: ", data);
    if(resData.length === 0){
      return res.status(200).send({es: 2, message: "No data found"});
    }
    return res.status(200).send({es: 0, data: resData, pageCount: totalPages});
  } catch (error) {
    return res.status(500).send({ es: 1, message: error });
  }
})

router.post("/add", async (req, res, next) => {
  const { userId } = req.user;
  const { text } = req.body;
  console.log("userId: ", userId);
  try {
    const post = await Post.create({ textContent: text, userId });
    return res
      .status(200)
      .send({ es: 0, message: "Post added successfully", postId: post._id });
  } catch (error) {
    return res.status(500).send({ es: 1, message: error });
  }
});

router.delete("/delete/:postId", async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByIdAndDelete(postId);
    return res
      .status(200)
      .send({ es: 0, message: "Post removed successfully" });
  } catch (error) {
    return res.status(500).send({ es: 1, message: error });
  }
});

router.put('/edit/:postId', async (req,res,next) => {
  const { postId } = req.params;
  const { text } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(postId, {textContent: text, lastUpdated: new Date().getTime()}, {new: true});
    return res
    .status(200)
    .send({ es: 0, message: "Post updated successfully", updated: post.textContent });
  } catch (error) {
    return res.status(500).send({ es: 1, message: error });
  }
})

router.post('/addComment/:postId', async (req, res, next) => {
  try {
    const { text } = req.body;
    const { id } = req.user;
    const { postId } = req.params;
    console.log("user: ", req.user);
    console.log(text, id, postId)
    const post = await Post.findByIdAndUpdate(postId, {$push: {comments: {userId: id, text}}, $inc: {commentCount: 1}}, {new: true});
    console.log("post: ", post);
    return res
      .status(200)
      .send({ es: 0, message: "Comment added successfully", meta: {count: post.commentCount} });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).send({ es: 1, message: error.toString() });
  }
})

module.exports = router;
