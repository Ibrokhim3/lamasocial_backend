import path from "path";
import { pool } from "../config/db_config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { __dirname } from "../../server.js";
import { __filename } from "../../server.js";
import { rmSync } from "fs";

export const authCtr = {
  REGISTER: async (req, res) => {
    try {
      const { username, password, email, password2 } = req.body;
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

      if (password !== password2) {
        return res
          .status(400)
          .send("Passwords weren't mathched, please type again");
      }

      const hashPsw = await bcrypt.hash(password, 12);

      // const url = path.join(__dirname, "./upload_img/", filename);

      await pool.query(
        `INSERT INTO users(username, email, password) VALUES($1, $2, $3)`,
        [username, email, hashPsw]
      );

      // req.files.img.mv(url, function (err) {
      //   if (err) {
      //     return res.send(err);
      //   }
      // });

      return res.status(201).send("User successfully registrated!");
    } catch (error) {
      return console.log(error.message);
    }
  },
  GET_USERS: async (req, res) => {
    const { id } = req.params;
    const images = await pool.query(`SELECT * FROM image_files where id=$1`, [
      id,
    ]);

    return res.json(images.rows[0]);
  },
  LOGIN: async (req, res) => {
    try {
      const { username, password } = req.body;
      const foundedUser = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
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
          username: foundedUser.rows[0].user_name,
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
          `INSERT INTO jwt(user_id, username, token) VALUES($1, $2,$3) `,
          [user_id, username, token]
        );
      }
      await pool.query(`UPDATE jwt SET user_id=$1, username=$2, token=$3`, [
        user_id,
        username,
        token,
      ]);

      return res.status(201).send({
        msg: `You're logged in as a(n) ${username}!`,
        token,
      });
    } catch (error) {
      return console.log(error.message);
    }
  },
};
