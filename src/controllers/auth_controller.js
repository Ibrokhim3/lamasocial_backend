import path from "path";
import { pool } from "../config/db_config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { __dirname } from "../../server.js";
import { __filename } from "../../server.js";
import { rmSync } from "fs";

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
      const {
        username,
        password,
        user_email,
        password2,
        avatar_url,
        cover_url,
      } = req.body;

      // const { name, data, mimetype, size } = req.files.img;
      // const filename = Date.now() + path.extname(name);

      //username ga validation qilsaboladi

      const foundedUser = await pool.query(
        `SELECT * from users where username=$1`,
        [username]
      );

      if (foundedUser.rows[0]) {
        return res.send("Username already exists");
      }

      const users = await pool.query(`SELECT * from users`);

      const userEmail = users.rows.find((u) => u.user_email === user_email);

      if (userEmail) {
        return res.status(400).send("This email already exists");
      }

      if (password !== password2) {
        return res
          .status(400)
          .send("Passwords weren't mathched, please type again");
      }

      const hashPsw = await bcrypt.hash(password, 12);

      // const url = path.join(__dirname, "./upload_img/", filename);

      const userId = await pool.query(
        `INSERT INTO users(username, user_email, password) VALUES($1, $2, $3) returning user_id`,
        [username, user_email, hashPsw]
      );

      await pool.query(
        `INSERT INTO avatar(avatar_url, user_id) VALUES($1, $2)`,
        [avatar_url, userId.rows[0].user_id]
      );

      await pool.query(`INSERT INTO cover(cover_url, user_id) VALUES($1,$2)`, [
        cover_url,
        userId.rows[0].user_id,
      ]);

      // req.files.img.mv(url, function (err) {
      //   if (err) {
      //     return res.send(err);
      //   }
      // });

      return res.status(201).json("User successfully registrated!");
    } catch (error) {
      return console.log(error.message);
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
