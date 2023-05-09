import { pool } from "../config/db_config.js";
import path from "path";
import { __dirname } from "../../server.js";
import { __filename } from "../../server.js";
import cloudinary from "cloudinary";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import jwt from "jsonwebtoken";
import { log } from "console";

export const mainCtr = {
  GET_POSTS: async (req, res) => {
    try {
      const posts = await pool.query(
        //hammasini select qilish shart emas
        `SELECT * FROM posts p JOIN users u ON p.created_by = u.user_id JOIN avatar a ON a.user_id=u.user_id JOIN likes l ON l.post_id=p.post_id`
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

      const { post_url, name, mimetype, size, public_id } = req.body;

      console.log(post_url);

      // const filename = Date.now() + path.extname(name);

      // const url = path.join(__dirname, "./upload_video/", filename);

      const time = await pool.query(
        `INSERT INTO posts(created_by, post_url, size) VALUES($1, $2, $3) RETURNING uploaded_time `,
        [user_id, post_url, (+size / 1048576).toFixed(2)]
      );

      let ts = Date.now();

      let date_time = new Date(ts);
      let date = date_time.getDate();
      let month = date_time.getMonth() + 1;
      let year = date_time.getFullYear();
      let hours = date_time.getHours();
      let minutes = date_time.getMinutes();

      console.log(date, month, hours, year, minutes);

      dayjs.extend(relativeTime);

      let a = dayjs(time.rows[0].uploaded_time);

      const timeAgo = dayjs().from(a);

      console.log(timeAgo);

      // req.files.video.mv(url, function (err) {
      //   if (err) {
      //     return res.send(err);
      //   }
      // });

      res.status(201).json("Post uploaded successfully!");
    } catch (error) {
      return console.log(error.message);
    }
  },
  GET_USER_FRIENDS: async (req, res) => {
    try {
      const userFriends = await pool.query(
        `SELECT u.username, a.file_url FROM users u FULL JOIN avatar a ON u.user_id = a.user_id`
      );
      res.status(200).send(userFriends.rows);
    } catch (error) {
      return console.log(error.message);
    }
  },
  POST_LIKES: async (req, res) => {
    const { post_id } = req.body;
    const { token } = req.headers;

    const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

    const isLiked = await pool.query(`SELECT * FROM likes where post_id=$1`, [
      post_id,
    ]);

    if (!isLiked.rows[0]) {
      await pool.query(`INSERT INTO likes(post_id) VALUES($1)`, [post_id]);
    }

    const userId = await pool.query(
      `SELECT user_id from likes where $1 =ANY(user_id) AND post_id=$2`,
      [user_id, post_id]
    );

    let likeResult = 0;

    const likesNum = await pool.query(`SELECT * FROM likes where post_id=$1`, [
      post_id,
    ]);

    if (!userId.rows[0]) {
      likeResult = likesNum.rows[0].likes + 1;

      await pool.query(
        `UPDATE likes SET likes=$1, user_id=array_append(user_id, $2) where post_id=$3`,
        [likeResult, user_id, post_id]
      );

      return res.send("Like");
    }

    likeResult = likesNum.rows[0].likes - 1;

    await pool.query(
      `UPDATE likes SET likes=$1, user_id=array_remove(user_id, $2) where post_id=$3`,
      [likeResult, user_id, post_id]
    );

    return res.send("Dislike");
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
