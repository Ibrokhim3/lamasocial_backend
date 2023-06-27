import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary-config.js";
import { pool } from "../config/db_config.js";

export const mainCtr = {
  GET_POSTS: async (req, res) => {
    try {
      const posts = await pool.query(
        //hammasini select qilish shart emas
        `SELECT p.post_img_url, p.post_text, u.username, u.profile_img_url, l.* FROM posts p JOIN users u ON p.user_id = u.user_id JOIN likes l ON p.post_id=l.post_id`
      );

      // const { token } = req.headers;
      // const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      res.status(200).json({
        posts: posts.rows,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        error: true,
        message: "Internal server error uploading image ",
      });
    }
  },
  GET_USER_POSTS: async (req, res) => {
    try {
      const { token } = req.headers;
      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      // const posts = await pool.query(
      //   //hammasini select qilish shart emas
      //   `SELECT p.post_img_url, p.post_text, u.username, u.profile_img_url, l.* FROM posts p JOIN users u ON p.user_id = u.user_id JOIN likes l ON p.post_id=l.post_id where p.user_id=$1`,
      //   [user_id]
      // );

      const posts = await pool.query(
        //hammasini select qilish shart emas
        `SELECT p.post_img_url, p.post_text, l.* FROM posts p JOIN likes l ON p.post_id=l.post_id where p.user_id=$1`,
        [user_id]
      );

      console.log(posts.rows);

      return res.status(200).json({
        posts: posts.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: "Internal server error uploading image ",
      });
    }
  },
  ADD_USER_POST: async (req, res) => {
    try {
      const { postText } = req.body;

      if (!req.file) {
        return res.status(400).json("Image was not uploaded");
      }

      const postImg = req.file;
      const { token } = req.headers;

      const userData = jwt.verify(token, process.env.SECRET_KEY);

      if (+postImg?.size / 1048576 > 2) {
        return res
          .status(400)
          .json("The size of the post-image must not be over 2mb");
      }

      // //Uploading file to the cloudinary server:

      let result = null;

      const options = {
        folder: "lamasocial_data",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      // //file1
      try {
        result = await cloudinary.uploader.upload(postImg.path, options);

        if (!result) {
          return res.status(500).json("Internal server error uploading image ");
        }

        // return result.public_id;
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          error: true,
          message: "Internal server error uploading image ",
        });
      }

      const postImgUrl = result?.secure_url || null;

      const postPublicId = result?.public_id || null;

      const postInfo = await pool.query(
        `INSERT INTO posts(user_id, username, post_img_url, post_public_id, post_text) VALUES($1, $2, $3, $4, $5) RETURNING uploaded_time, post_id`,
        [
          userData.user_id,
          userData.userName,
          postImgUrl,
          postPublicId,
          postText,
        ]
      );

      const isLiked = await pool.query(`SELECT * FROM likes where post_id=$1`, [
        postInfo.rows[0].post_id,
      ]);

      if (!isLiked.rows[0]) {
        await pool.query(`INSERT INTO likes(post_id) VALUES($1)`, [
          postInfo.rows[0].post_id,
        ]);
      }

      res.status(201).json("Post uploaded successfully!");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  GET_USER_FRIENDS: async (req, res) => {
    try {
      const { token } = req.headers;
      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      const userFriends = await pool.query(
        `SELECT u.username, u.profile_img_url FROM users u where u.user_id != $1`,
        [user_id]
      );

      return res.status(200).send(userFriends.rows);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  POST_LIKES: async (req, res) => {
    try {
      const { post_id } = req.body;
      const { token } = req.headers;

      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      // const isLiked = await pool.query(`SELECT * FROM likes where post_id=$1`, [
      //   post_id,
      // ]);

      // if (!isLiked.rows[0]) {
      //   await pool.query(`INSERT INTO likes(post_id) VALUES($1)`, [post_id]);
      // }

      const userId = await pool.query(
        `SELECT user_id from likes where $1 =ANY(user_id) AND post_id=$2`,
        [user_id, post_id]
      );

      let likeResult = 0;

      const likesNum = await pool.query(
        `SELECT * FROM likes where post_id=$1`,
        [post_id]
      );

      if (!userId.rows[0]) {
        likeResult = likesNum.rows[0].likes + 1;

        await pool.query(
          `UPDATE likes SET likes=$1, user_id=array_append(user_id, $2) where post_id=$3`,
          [likeResult, user_id, post_id]
        );

        return res.status(201).json("Liked");
      }

      likeResult = likesNum.rows[0].likes - 1;

      await pool.query(
        `UPDATE likes SET likes=$1, user_id=array_remove(user_id, $2) where post_id=$3`,
        [likeResult, user_id, post_id]
      );

      return res.status(201).json("Liked");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
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
