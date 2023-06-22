import path from "path";
import { pool } from "../config/db_config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { __dirname } from "../../server.js";
import { __filename } from "../../server.js";
import { rmSync } from "fs";
import { v4 } from "uuid";
import cloudinary from "../config/cloudinary-config.js";

export const authCtr = {
  //updateUsers API
  GET_USERS: async (req, res) => {
    const users = await pool.query(`SELECT * FROM users`);

    return res.json(users.rows);
  },
  GET_USER_INFO: async (req, res) => {
    const { token } = req.headers;
    const { user_id } = jwt.verify(token, process.env.SECRET_KEY);
    const user = await pool.query(`SELECT * FROM users where user_id=$1`, [
      user_id,
    ]);

    return res.json(user.rows[0]);
  },
  REGISTER: async (req, res) => {
    try {
      console.log(req.file);
      // const { userName, password, userEmail, password2 } = req.body;

      // const { name, size, mv } = req.files.profileImg;

      // const { name: name2, size: size2, mv: mv2 } = req.files.coverImg;

      // if (+size / 1048576 > 2 && +size2 / 1048576 > 2) {
      //   return res
      //     .status(400)
      //     .json("The size of the profile-image must not be over 2mb");
      // }

      // const foundedUser = await pool.query(
      //   `SELECT * from users where username=$1`,
      //   [userName]
      // );

      // if (foundedUser.rows[0]) {
      //   return res.status(400).json("Username already exists");
      // }

      // const users = await pool.query(`SELECT * from users`);

      // const findUser = users.rows.find((u) => u.user_email === userEmail);

      // if (findUser) {
      //   return res.status(400).json("This email already exists");
      // }

      // if (password !== password2) {
      //   return res
      //     .status(400)
      //     .send("Passwords weren't matched, please try again");
      // }

      // const hashPsw = await bcrypt.hash(password, 12);

      // const filename = v4() + path.extname(name);
      // const filename2 = v4() + path.extname(name2);

      // mv(path.resolve("assets/" + filename), (err) => {
      //   if (err)
      //     return res
      //       .status(400)
      //       .json("Something went wrong, while uploading a file");
      // });

      // mv2(path.resolve("assets/" + filename2), (err) => {
      //   if (err)
      //     return res
      //       .status(400)
      //       .json("Something went wrong, while uploading a file");
      // });

      // //Uploading file to the cloudinary server:

      // let result = null;
      // let result2 = null;

      // const options = {
      //   folder: "lamasocial",
      //   use_filename: true,
      //   unique_filename: false,
      //   overwrite: true,
      // };

      // //file1

      // try {
      //   // result = await cloudinary.uploader.upload(
      //   //   "assets/" + filename,
      //   //   options
      //   // );

      //   result = await cloudinary.uploader.upload(
      //     __dirname + "/assets/" + filename,
      //     options
      //   );

      //   if (!result) {
      //     return res.status(500).json("Internal server error uploading image");
      //   }
      //   // console.log(result);
      //   // return result.public_id;
      // } catch (error) {
      //   // console.log(error.message);
      //   return res.status(500).json({
      //     error: true,
      //     message: "Internal server error uploading image",
      //   });
      // }

      // //file2

      // try {
      //   result2 = await cloudinary.uploader.upload(
      //     __dirname + "/assets/" + filename,
      //     options
      //   );
      //   if (!result2) {
      //     return res.status(500).json("Internal server error uploading image");
      //   }
      //   // console.log(result);
      //   // return result.public_id;
      // } catch (error) {
      //   // console.log(error.message);
      //   return res.status(500).json({
      //     error: true,
      //     message: "Internal server error uploading image",
      //   });
      // }

      // const profileImgUrl = result?.secure_url;
      // const coverImgUrl = result2?.secure_url;

      // const profilePublicId = result?.public_id;
      // const coverPublicId = result2?.public_id;

      // //deleting the file from folder

      // fs.unlink(path.resolve("assets/" + filename), function (err) {
      //   if (err) throw err;
      //   console.log("File deleted!");
      // });

      // fs.unlink(path.resolve("assets/" + filename2), function (err) {
      //   if (err) throw err;
      //   console.log("File deleted!");
      // });

      // const userId = await pool.query(
      //   `INSERT INTO users(username, user_email, password, profile_img_url, cover_img_url, profile_public_id, cover_public_id ) VALUES($1, $2, $3, $4,$5,$6,$7) returning user_id`,
      //   [
      //     userName,
      //     userEmail,
      //     hashPsw,
      //     profileImgUrl,
      //     coverImgUrl,
      //     profilePublicId,
      //     coverPublicId,
      //   ]
      // );

      return res.status(201).json("User successfully registrated!");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error uploading image",
      });
    }
  },
  LOGIN: async (req, res) => {
    try {
      const { user_email, password } = req.body;
      const foundedUser = await pool.query(
        `SELECT * FROM users WHERE user_email = $1`,
        [user_email]
      );
      if (!foundedUser.rows[0]) {
        return res.status(404).send("User not found");
      }

      const psw = await bcrypt.compare(password, foundedUser.rows[0].password);

      if (!psw) {
        return res.send("Incorrect password!");
      }

      let token = jwt.sign(
        {
          user_id: foundedUser.rows[0].user_id,
          user_email: foundedUser.rows[0].user_email,
          // profile_img: foundedUser.rows[0].profile_img,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: process.env.JWT_TIME,
        }
      );

      const userInfo = jwt.verify(token, process.env.SECRET_KEY);
      const { user_id } = userInfo;

      const jwtInfo = await pool.query(`SELECT * FROM JWT`);

      if (!jwtInfo.rows[0]) {
        await pool.query(
          `INSERT INTO jwt(user_id, user_email, token) VALUES($1, $2,$3) `,
          [user_id, user_email, token]
        );
      }
      await pool.query(`UPDATE jwt SET user_id=$1, user_email=$2, token=$3`, [
        user_id,
        user_email,
        token,
      ]);

      await pool.query(`UPDATE users SET islogged=true where user_id=$1`, [
        user_id,
      ]);

      return res.status(201).json({
        msg: `You're logged in!`,
        token,
      });
    } catch (error) {
      return console.log(error.message);
    }
  },
  UPDATE_USER: async (req, res) => {
    try {
      const { token } = req.headers;
      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);
      let { username, user_email, password, avatar_url, cover_url } = req.body;

      const foundUser = await pool.query(
        `SELECT * FROM users WHERE user_id=$1`,
        [user_id]
      );

      const foundFiles = await pool.query(
        `SELECT a.avatar_url, c.cover_url from avatar a JOIN cover c ON a.user_id=c.user_id`
      );

      if (!foundUser.rows[0]) {
        return res.status(404).send("User not found!");
      }

      const hashPsw = await bcrypt.hash(password, 12);

      const {
        username: u_username,
        user_email: u_user_email,
        password: u_password,
      } = foundUser.rows[0];

      const { avatar_url: a_avatar_url, cover_url: c_cover_url } =
        foundFiles.rows[0];

      username = username ? username : u_username;
      user_email = user_email ? user_email : u_user_email;
      password = password ? hashPsw : u_password;
      avatar_url = avatar_url ? avatar_url : a_avatar_url;
      cover_url = cover_url ? cover_url : c_cover_url;

      await pool.query(
        `UPDATE users SET 
        username=$1, user_email=$2, password=$3 where user_id=$4`,
        [username, user_email, password, user_id]
      );

      await pool.query(
        `UPDATE avatar SET 
        avatar_url=$1 where user_id=$2`,
        [avatar_url, user_id]
      );

      await pool.query(
        `UPDATE cover SET 
        cover_url=$1 where user_id=$2`,
        [cover_url, user_id]
      );

      res.status(200).json(`Updated successfully`);
    } catch (error) {
      return console.log(error.message);
    }
  },
};
