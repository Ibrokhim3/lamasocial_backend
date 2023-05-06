import { pool } from "../config/db_config.js";
import path from "path";
import { __dirname } from "../../server.js";
import { __filename } from "../../server.js";
import cloudinary from "cloudinary";

export const mainCtr = {
  GET_POSTS: async (req, res) => {
    try {
      const posts = await pool.query(
        `SELECT * FROM files f JOIN users u ON f.user_id = u.user_id`
      );

      res.status(200).send(posts.rows);
    } catch (error) {
      return console.log(error.message);
    }
  },
  ADD_USER_POST: async (req, res) => {
    try {
      const userData = await pool.query(`SELECT * FROM jwt`);
      const { user_id } = userData.rows[0];
      // const userData = await pool.query(`SELECT * FROM jwt`);
      // const { user_id, user_name, image_title } = userData.rows[0];

      const { post_title, post_url, name, mimetype, size, public_id } =
        req.body;

      const filename = Date.now() + path.extname(name);

      const url = path.join(__dirname, "./upload_video/", filename);

      await pool.query(
        `INSERT INTO posts (post_title, created_by, post_url, size, public_id) VALUES($1, $2, $3, $4, $5) `,
        [post_title, user_id, post_url, (+size / 1048576).toFixed(2), public_id]
      );

      // req.files.video.mv(url, function (err) {
      //   if (err) {
      //     return res.send(err);
      //   }
      // });

      res.status(201).send("Post uploaded successfully!");
    } catch (error) {
      return console.log(error.message);
    }
  },
  GET_USER_VIDEOS: async (req, res) => {
    try {
      const userData = await pool.query(`SELECT * FROM jwt`);
      const { user_id, user_name, image_title } = userData.rows[0];
      const userVideos = await pool.query(
        `SELECT * FROM videos where created_by=$1`,
        [user_id]
      );
      res.status(200).send({ msg: "User videos", userVideos: userVideos.rows });
    } catch (error) {
      return console.log(error.message);
    }
  },
  POST_LIKES: async (req, res) => {
    const { post_id, user_id } = req.body;

    // const foundUser = await pool.query(`SELECT * FROM likes where user_id=$1`, [
    //   user_id,
    // ]);

    // if (foundUser.rows[0]) {
    //   await pool.query(`UPDATE likes SET=-1`);
    // }

    const postId = await pool.query(`SELECT * from likes where post_id=$1`, [
      post_id,
    ]);

    const likes = postId.rows[0].likes;

    let likeResult = 0;

    const isLiked = await pool.query(
      `SELECT isliked from users where user_id=$1`,
      [user_id]
    );

    console.log(isLiked.rows[0].isliked);

    if (isLiked.rows[0].isliked === true && likes !== 0) {
      likeResult = likes - 1;

      console.log(likeResult);

      await pool.query(`UPDATE users SET isliked=false where user_id=$1`, [
        user_id,
      ]);

      await pool.query(`UPDATE likes SET likes=$1 where post_id='1'`, [
        likeResult,
      ]);

      return res.status(201).send("Dislike");
    }

    await pool.query(`UPDATE users SET isliked=true where user_id=$1`, [
      user_id,
    ]);

    likeResult = likes + 1;

    console.log(likeResult);

    await pool.query(`UPDATE likes SET likes=$1 where post_id='1'`, [
      likeResult,
    ]);
    return res.send("OK");
  },
  UPDATE_USER_VIDEOS: async (req, res) => {
    try {
      const { id, video_title } = req.body;

      const { id: id2, video_title: video_title2 } = videoCtr.GET_VIDEOS;
      await pool.query(`UPDATE videos SET video_title=$1 where id=$2`, [
        video_title,
        id,
      ]);
      res.status(200).send({ msg: "Video updated successfully", id2 });
    } catch (error) {
      return console.log(error.message);
    }
  },
  DELETE_USER_VIDEOS: async (req, res) => {
    try {
      const { id } = req.body;
      const { id: id2 } = videoCtr.GET_VIDEOS;
      await pool.query(`DELETE from videos where id=$1`, [id]);
      res.status(200).send({ msg: "Video deleted successfully", id2 });
    } catch (error) {
      return console.log(error.message);
    }
  },
};

const testFunc = () => {
  const video_url =
    "https://res.cloudinary.com/dephdgqpo/video/upload/v1682439157/youtube_videos/modp9tdtywvxiktaynec.mp4";

  const indexUrl = video_url.indexOf("upload");

  const download_url = video_url.slice(
    indexUrl + 5,
    0,
    "f_auto/fl_attachment:pretty_flower"
  );

  return console.log(download_url);
};
testFunc();
