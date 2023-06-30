import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary-config.js";
import { pool } from "../config/db_config.js";
import crypto from "crypto";
import sendEmail from "../../utils/send-email.js";
import { rmSync } from "fs";

export const authCtr = {
  //updateUsers API
  GET_USERS: async (req, res) => {
    const users = await pool.query(`SELECT * FROM users`);

    return res.json(users.rows);
  },
  GET_USER_INFO: async (req, res) => {
    try {
      const { token } = req.headers;
      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      const user = await pool.query(`SELECT * FROM users where user_id=$1`, [
        user_id,
      ]);

      return res.status(200).json(user.rows[0]);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error uploading",
      });
    }
  },
  REGISTER: async (req, res) => {
    try {
      const profileImg = req?.files[0];
      const coverImg = req?.files[1];

      const { userName, password, userEmail, password2 } = req.body;

      if (profileImg) {
        if (+profileImg?.size / 1048576 > 2) {
          return res
            .status(400)
            .json("The size of the profile-image must not be over 2mb");
        }
      }

      if (coverImg) {
        if (+coverImg?.size / 1048576 > 2) {
          return res
            .status(400)
            .json("The size of the cover-image must not be over 2mb");
        }
      }

      const foundedUser = await pool.query(
        `SELECT * from users where username=$1`,
        [userName]
      );

      if (foundedUser.rows[0]) {
        return res.status(400).json("Username already exists");
      }

      const users = await pool.query(`SELECT * from users`);

      const findUser = users.rows.find((u) => u.user_email === userEmail);

      if (findUser) {
        return res.status(400).json("This email already exists");
      }

      if (password !== password2) {
        return res
          .status(400)
          .send("Passwords weren't matched, please try again");
      }

      const hashPsw = await bcrypt.hash(password, 12);

      // //Uploading file to the cloudinary server:

      let result = null;
      let result2 = null;

      const options = {
        folder: "lamasocial_data",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      // //file1
      if (profileImg) {
        try {
          result = await cloudinary.uploader.upload(profileImg.path, options);

          if (!result) {
            return res
              .status(500)
              .json("Internal server error uploading image ");
          }

          // return result.public_id;
        } catch (error) {
          return res.status(500).json({
            error: true,
            message: "Internal server error uploading image ",
          });
        }
      }

      // //file2

      if (coverImg) {
        try {
          result2 = await cloudinary.uploader.upload(coverImg.path, options);

          if (!result2) {
            return res
              .status(500)
              .json("Internal server error uploading image");
          }
          // console.log(result);
          // return result.public_id;
        } catch (error) {
          // console.log(error.message);
          return res.status(500).json({
            error: true,
            message: "Internal server error uploading",
          });
        }
      }

      const profileImgUrl = result?.secure_url || null;
      const coverImgUrl = result2?.secure_url || null;

      const profilePublicId = result?.public_id || null;
      const coverPublicId = result2?.public_id || null;

      const userId = await pool.query(
        `INSERT INTO users(username, user_email, password, profile_img_url, cover_img_url, profile_public_id, cover_public_id ) VALUES($1, $2, $3, $4,$5,$6,$7) returning user_id`,
        [
          userName,
          userEmail,
          hashPsw,
          profileImgUrl,
          coverImgUrl,
          profilePublicId,
          coverPublicId,
        ]
      );

      return res.status(201).json("User successfully registrated!");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  LOGIN: async (req, res) => {
    try {
      const { userEmail, password } = req.body;
      const foundedUser = await pool.query(
        `SELECT * FROM users WHERE user_email = $1`,
        [userEmail]
      );
      if (!foundedUser.rows[0]) {
        return res.status(404).json("User not found");
      }

      const psw = await bcrypt.compare(password, foundedUser.rows[0].password);

      if (!psw) {
        return res.status(400).json("Invalid password!");
      }

      let token = jwt.sign(
        {
          user_id: foundedUser.rows[0].user_id,
          userName: foundedUser.rows[0].username,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: process.env.JWT_TIME,
        }
      );

      return res.status(201).json({
        msg: `You're logged in!`,
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  UPDATE_USER: async (req, res) => {
    try {
      const { token } = req.headers;
      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      const foundUser = await pool.query(
        `SELECT * FROM users WHERE user_id=$1`,
        [user_id]
      );

      if (!foundUser.rows[0]) {
        return res.status(404).json("User not found!");
      }

      let { userName, userEmail, password } = req.body;

      let profileImg = req?.files[0];
      let coverImg = req?.files[1];

      if (profileImg) {
        if (+profileImg?.size / 1048576 > 2) {
          return res
            .status(400)
            .json("The size of the profile-image must not be over 2mb");
        }
      }

      if (coverImg) {
        if (+coverImg?.size / 1048576 > 2) {
          return res
            .status(400)
            .json("The size of the cover-image must not be over 2mb");
        }
      }

      // //Uploading file to the cloudinary server:

      let result = null;
      let result2 = null;

      const options = {
        folder: "lamasocial_data",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      };

      // //file1
      if (profileImg) {
        try {
          result = await cloudinary.uploader.upload(profileImg.path, options);

          if (!result) {
            return res
              .status(500)
              .json("Internal server error uploading image ");
          }

          // return result.public_id;
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            error: true,
            message: "Internal server error uploading image ",
          });
        }
      }

      // //file2

      if (coverImg) {
        try {
          result2 = await cloudinary.uploader.upload(coverImg.path, options);

          if (!result2) {
            return res
              .status(500)
              .json("Internal server error uploading image");
          }
          // console.log(result);
          // return result.public_id;
        } catch (error) {
          // console.log(error.message);
          return res.status(500).json({
            error: true,
            message: "Internal server error uploading",
          });
        }
      }

      const profileImgUrl = result?.secure_url;
      const coverImgUrl = result2?.secure_url;

      const profilePublicId = result?.public_id;
      const coverPublicId = result2?.public_id;

      let profilePublicId2 = null;
      let coverPublicId2 = null;

      const hashPsw = password && (await bcrypt.hash(password, 12));

      const {
        username,
        user_email,
        password: u_password,
        profile_img_url,
        cover_img_url,
        profile_public_id,
        cover_public_id,
      } = foundUser.rows[0];

      userName = userName ? userName : username;
      userEmail = userEmail ? userEmail : user_email;
      password = password ? hashPsw : u_password;
      profileImg = profileImg ? profileImgUrl : profile_img_url;
      coverImg = coverImg ? coverImgUrl : cover_img_url;
      profilePublicId2 = profilePublicId ? profilePublicId : profile_public_id;
      coverPublicId2 = coverPublicId ? coverPublicId : cover_public_id;

      await pool.query(
        `UPDATE users SET 
        username=$1, user_email=$2, password=$3,profile_img_url=$4,cover_img_url=$5,profile_public_id=$6, cover_public_id=$7 where user_id=$8`,
        [
          userName,
          userEmail,
          password,
          profileImg,
          coverImg,
          profilePublicId2,
          coverPublicId2,
          user_id,
        ]
      );

      if (req.files) {
        try {
          result = await cloudinary.api.delete_resources([
            profile_public_id,
            cover_public_id,
          ]);

          if (!result) {
            return res.status(500).json("Internal server error");
          }
          // console.log(result);
          // return result.public_id;
        } catch (error) {
          // console.log(error.message);
          return res
            .status(500)
            .json({ error: true, message: "Internal server error" });
        }
      }

      return res.status(200).json(`Updated successfully`);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  ONLINE: async (req, res) => {
    try {
      const { isOnline } = req.body;
      const { token } = req.headers;

      const { user_id } = jwt.verify(token, process.env.SECRET_KEY);

      const foundedUser = await pool.query(
        `SELECT * FROM users WHERE user_id = $1`,
        [user_id]
      );
      if (!foundedUser.rows[0]) {
        return res.status(404).json("User not found");
      }

      await pool.query(`UPDATE users SET isonline=$1 where user_id=$2`, [
        isOnline,
        foundedUser.rows[0].user_id,
      ]);

      return res.status(201).json("Your status");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error",
      });
    }
  },
  SEND_EMAIL: async (req, res) => {
    try {
      const { userEmail } = req.body;

      const user = await pool.query(`SELECT * from users where user_email=$1`, [
        userEmail,
      ]);

      if (!user) {
        return res.status(404).json("user with given email address not found");
      }

      let token = await pool.query(`SELECT * from token where user_id=$1`, [
        user.rows[0].user_id,
      ]);

      if (!token.rows[0]) {
        await pool.query(
          `INSERT INTO token( user_id, token) VALUES($1,$2) RETURNING token`,
          [user.rows[0].user_id, crypto.randomBytes(32).toString("hex")]
        );
      }

      const link = `Please go to this link: http://localhost:${3000}/lamasocial/${
        user.rows[0].user_id
      }/${token.rows[0].token}`;

      await sendEmail(user.rows[0].user_email, "Password reset", link);

      return res
        .status(201)
        .json("Password reset link sent to your email account. Please check");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message: "Error occured while sending email",
      });
    }
  },
  SET_NEW_PASS: async (req, res) => {
    try {
      const user = await pool.query(`SELECT * from users where user_id=$1`, [
        req.params.userId,
      ]);

      if (!user) {
        return res.status(400).json("invalid link or expired");
      }

      const token = await pool.query(
        `SELECT * from token where user_id=$1 AND token=$2`,
        [req.params.userId, req.params.token]
      );

      if (!token.rows) {
        return res.status(400).json("Invalid link or expired");
      }

      const hashPsw = await bcrypt.hash(req.body.password, 12);

      await pool.query(`UPDATE users SET password=$1 where user_id=$2`, [
        hashPsw,
        req.params.userId,
      ]);

      await pool.query(`DELETE from token where user_id=$1`, [
        req.params.userId,
      ]);

      return res.status(200).json("password reset sucessfully.");
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Error occured while sending email",
      });
    }
  },
};
