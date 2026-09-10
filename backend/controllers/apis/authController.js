const envfile = process.env;
let CryptoJS = require("crypto-js");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const helper = require("../../helpers/helper");
const { Validator } = require("node-input-validator");
const moment = require('moment');
const path = require("path");
var bcrypt = require('bcrypt');
const sequelize = require("sequelize");
const Op = sequelize.Op;
const stripeKey = envfile.stripe_secret_key || process.env.stripe_secret_key || "";
const stripe = stripeKey ? require("stripe")(stripeKey) : null;
const { users, cms, notifications } = require("../../models");

module.exports = {
  encryption: async (req, res) => {
    try {
      const v = new Validator(req.headers, {
        secret_key: "required|string",
        publish_key: "required|string",
      });

      let errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      let sk_data = req.headers.secret_key;
      let pk_data = req.headers.publish_key;
      var encryptedSkBuffer = CryptoJS.AES.encrypt(
        sk_data,
        envfile.crypto_key
      ).toString();
      var encryptedPkBuffer = CryptoJS.AES.encrypt(
        pk_data,
        envfile.crypto_key
      ).toString();
      var decryptedSkBuffer = CryptoJS.AES.decrypt(
        encryptedSkBuffer,
        envfile.crypto_key
      );
      var originalskText = decryptedSkBuffer.toString(CryptoJS.enc.Utf8);
      var decryptedPkBuffer = CryptoJS.AES.decrypt(
        encryptedPkBuffer,
        envfile.crypto_key
      );
      var originalpkTextr = decryptedPkBuffer.toString(CryptoJS.enc.Utf8);

      return helper.success(res, "data", {
        encryptedSkBuffer,
        encryptedPkBuffer,
        originalskText,
        originalpkTextr,
      });
    } catch (err) {
      console.log(err, ">>>>>>>>>>");
      // return helper.failed (res, err);
    }
  },


  login: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
        password: "required",
      });

      const errors = await helper.checkValidation(v);
      if (errors) return helper.failed(res, errors);

      const { email, password, role, fcmToken, deviceType } = req.body;
      const loginTime = helper.unixTimestamp();

      const user = await users.findOne({
        where: { email }
      });

      // 1. Check Email
      if (!user) {
        return helper.failed(res, "Your email is wrong");
      }

      // 2. Check Password (CryptoJS AES, plain text, or bcrypt fallback)
      const secretKey = envfile.crypto_key || envfile.encrypt_sec_key || 'dealconect@2026!!';
      let isMatch = false;

      if (user.password) {
        // 2a. CryptoJS AES decrypt check
        try {
          const bytes = CryptoJS.AES.decrypt(user.password, secretKey);
          const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
          if (decryptedPassword === password) {
            isMatch = true;
          }
        } catch (e) {
          isMatch = false;
        }

        // 2b. Plain text fallback
        if (!isMatch && user.password === password) {
          isMatch = true;
        }

        // 2c. Bcrypt fallback
        if (!isMatch && user.password.startsWith('$2')) {
          try {
            isMatch = await bcrypt.compare(password, user.password);
          } catch (e) {
            isMatch = false;
          }
        }
      }

      if (!isMatch) {
        return helper.failed(res, "Your password is wrong");
      }

      // Determine active role from frontend toggle (e.g. "dealer" or "user")
      const dbRole = (user.role === 2 || user.role === "dealer") ? "dealer" : ((user.role === 3 || user.role === "admin") ? "admin" : "user");
      const activeRole = role || dbRole;

      if (user.status === 0 || user.status === "inactive" || user.status === "blocked") {
        return helper.failed(res, "Your account is suspended. Please contact the admin.");
      }

      const token = jwt.sign(
        {
          data: {
            id: user.id,
            loginTime
          }
        },
        envfile.crypto_key || 'dealconect@2026!!',
        { expiresIn: "30d" }
      );

      const userJson = user.toJSON();
      delete userJson.password;

      return helper.success(res, "Login successful", {
        ...userJson,
        role: activeRole,
        company: userJson.name + (activeRole === 'dealer' ? ' Realty Agency' : ' Buyer/Seller'),
        avatar: userJson.image || (activeRole === 'dealer'
          ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
        token
      });

    } catch (err) {
      console.log(err);
      return helper.error(res, err.message || err);
    }
  },

  signUp: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
        password: "required|minLength:6",
        name: "required"
      });

      const errors = await helper.checkValidation(v);
      if (errors) return helper.failed(res, errors);

      const {
        email,
        password,
        name,
        countryCode = "+91",
        phone,
        mobile_no,
        role = "dealer"
      } = req.body;

      const login_time = helper.unixTimestamp();

      const existingUser = await users.findOne({
        where: { email }
      });

      if (existingUser) {
        return helper.failed(res, "Account with this email already exists");
      }

      const roleVal = role === "dealer" ? 2 : (role === "admin" ? 3 : 1);
      const secretKey = envfile.crypto_key || envfile.encrypt_sec_key || 'dealconect@2026!!';
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

      const user = await users.create({
        name: name,
        email: email,
        password: encryptedPassword,
        mobile_no: phone || mobile_no || "",
        role: roleVal,
        status: 1,
        is_approve: 0,
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
      });

      const token = jwt.sign(
        {
          data: {
            id: user.id,
            login_time
          }
        },
        envfile.crypto_key || 'dealconect@2026!!',
        { expiresIn: "30d" }
      );

      const userData = user.toJSON();
      delete userData.password;
      const actualRole = user.role === 2 ? "dealer" : (user.role === 3 ? "admin" : "user");

      return helper.success(res, "Signup successful", {
        ...userData,
        role: actualRole,
        company: userData.name + (actualRole === "dealer" ? " Realty Agency" : " Buyer/Seller"),
        avatar: userData.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        token
      });

    } catch (err) {
      console.log(err);
      return helper.error(res, err.message || err);
    }
  },

  logout: async (req, res) => {
    try {
      let time = helper.unixTimestamp();
      const logout = await users.update(
        {
          loginTime: time,
          fcmToken: null
        },
        {
          where: {
            id: req.auth.id,
          },
        }
      );
      return helper.success(res, "Logout Successfully");
    } catch (error) {
      return helper.error(res, error);
    }
  },
  accountDeleted: async (req, res) => {
    try {
      const find_user = await users.findOne({
        where: {
          id: req.auth.id,

        },
        raw: true,
        nest: true,
      });
      if (find_user) {

        let User = users.destroy(

          {
            where: {
              id: req.auth.id,
            },
          }
        );
        return helper.success(res, "Account deleted succesfully!");
      } else {
        return helper.failed(res, "Account not found ");
      }
    } catch (error) {

      return helper.error(res, error);
    }
  },
  /////////
  edit_profile: async (req, res) => {
    try {
      const userId = req.auth?.id || req.body.userId;
      if (!userId) return helper.failed(res, "User ID is required");

      const { email, phone, mobile_no, country_code, name, profileImage, image } = req.body;

      const updateData = {};

      if (email) updateData.email = email;
      if (phone || mobile_no) updateData.mobile_no = phone || mobile_no;
      if (country_code) updateData.country_code = country_code;
      if (name) updateData.name = name;
      if (profileImage || image) updateData.image = profileImage || image;

      // check email exists
      if (email) {
        const emailExists = await users.findOne({
          where: {
            email: email,
            id: { [Op.ne]: userId },
            deletedAt: null
          }
        });

        if (emailExists) {
          return helper.failed(res, "Email already exists");
        }
      }

      if (req.files && (req.files.image || req.files.file)) {
        const file = req.files.image || req.files.file;
        let fileUrl = await helper.fileUpload(file, 'users');
        if (fileUrl) {
          updateData.image = fileUrl;
        }
      }

      await users.update(updateData, {
        where: { id: userId }
      });

      const updateduser = await users.findOne({
        where: { id: userId },
        attributes: { exclude: ["password", "otp"] }
      });

      return helper.success(res, "Profile Updated Successfully", updateduser);

    } catch (error) {
      console.error(error);
      return helper.error(res, error);
    }
  },
  change_password: async (req, res) => {
    const id = req.auth?.id || req.body.userId;
    if (!id) return helper.failed(res, "User ID is required");

    const { old_password, new_password } = req.body;
    try {
      const getuser = await users.findOne({ where: { id } });
      if (!getuser) {
        return helper.failed(res, "User not found");
      }

      const secretKey = envfile.crypto_key || envfile.encrypt_sec_key || 'dealconect@2026!!';
      let isValidPassword = false;

      // 1. CryptoJS AES decrypt check
      if (getuser.password) {
        try {
          const bytes = CryptoJS.AES.decrypt(getuser.password, secretKey);
          const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
          if (decryptedPassword === old_password) {
            isValidPassword = true;
          }
        } catch (e) {
          isValidPassword = false;
        }

        // 2. Plain text fallback
        if (!isValidPassword && getuser.password === old_password) {
          isValidPassword = true;
        }

        // 3. Bcrypt fallback
        if (!isValidPassword && getuser.password.startsWith('$2')) {
          try {
            isValidPassword = await bcrypt.compare(old_password, getuser.password);
          } catch (e) {
            isValidPassword = false;
          }
        }
      }

      if (!isValidPassword) {
        return helper.failed(res, "Incorrect old password");
      }

      // Encrypt new password using CryptoJS AES before saving into DB
      const encryptedNewPassword = CryptoJS.AES.encrypt(new_password, secretKey).toString();
      await users.update({ password: encryptedNewPassword }, { where: { id } });
      return helper.success(res, "Password updated successfully");
    } catch (err) {
      console.log(err);
      return helper.error(res, "Something went wrong");
    }
  },
  get_profile: async (req, res) => {
    try {
      const userId = req.query.userId || req.auth.id;

      const profile = await users.findOne({
        where: { id: userId },
        attributes: [`id`, `name`, `email`, `country_code`, `phone`, `profileImage`, `last_park_latitude`, `last_park_longitude`, `is_notification`, `status`],

      });
      if (!profile) {
        return helper.failed(res, "User not found");
      }
      const obj = profile.toJSON();
      return helper.success(res, "User Profile retrieved successfully", obj);
    } catch (error) {
      return helper.error(res, error.message);
    }
  },
  socialLogin: async (req, res) => {
    try {

      console.log(req.body, "SOCIAL LOGIN BODY");

      /* =======================
         1️⃣ Validation
      ======================= */
      const v = new Validator(req.body, {
        socialId: "required",
        loginType: "required|in:google,facebook,apple",
      });

      const errorsResponse = await helper.checkValidation(v);

      if (errorsResponse) {
        return helper.failed(res, errorsResponse);
      }

      /* =======================
         2️⃣ Extract Body
      ======================= */
      const {
        socialId,
        loginType,
        email,
        name,
        countryCode,
        phone,
        deviceToken,
        profileImage,
      } = req.body;

      const loginTime = helper.unixTimestamp();

      let isSignup = false;

      const role = "user";

      /* =======================
         3️⃣ Find Existing User
      ======================= */
      let user = await users.findOne({
        where: {
          socialId,
          loginType,
          role,
          deletedAt: null,
        },
      });

      /* =======================
         🚫 Block Inactive User
      ======================= */
      if (user && user.status !== "active") {
        return helper.failed(
          res,
          "Your account is not active. Please contact admin."
        );
      }

      /* =======================
         4️⃣ Link Existing Email
      ======================= */
      if (!user && email) {

        const existingUser = await users.findOne({
          where: {
            email,
            role,
            deletedAt: null,
          },
        });

        if (existingUser) {

          if (existingUser.status !== "active") {
            return helper.failed(
              res,
              "Your account is not active. Please contact admin."
            );
          }

          user = existingUser;

          await user.update({
            socialId: socialId,
            loginType: loginType,
            loginTime: loginTime,
            fcmToken: deviceToken,
          });
        }
      }

      /* =======================
         5️⃣ Signup
      ======================= */
      if (!user) {

        isSignup = true;

        /* =======================
           🔍 Check Soft Deleted User
        ======================= */
        let oldUser = await users.findOne({
          where: {
            socialId,
            loginType,
            role,
          },
          paranoid: false,
        });

        if (!oldUser && email) {
          oldUser = await users.findOne({
            where: {
              email,
              role,
            },
            paranoid: false,
          });
        }

        /* =======================
           🧠 Final Data
        ======================= */
        const finalName = name || oldUser?.name || null;

        const finalEmail = email || oldUser?.email || null;

        const finalImage =
          profileImage ||
          oldUser?.profileImage ||
          null;

        /* =======================
           🆕 Create User
        ======================= */
        user = await users.create({
          name: finalName,
          email: finalEmail,
          phone,
          countryCode: countryCode,
          role: role === 'owner' ? 'user' : role,
          profileImage: finalImage,
          socialId: socialId,
          loginType: loginType,
          loginTime: loginTime,
          fcmToken: deviceToken,
          status: "active",
        });

      } else {
        await user.update({
          loginTime: loginTime,
          fcmToken: deviceToken,
          ...(profileImage && { profileImage: profileImage }),
        });
      }

      const token = jwt.sign(
        {
          data: {
            id: user.id,
            loginTime: loginTime,
          },
        },
        envfile.crypto_key || 'dealconect@2026!!',
        {
          expiresIn: "30d",
        }
      );

      /* =======================
         8️⃣ Clean Response
      ======================= */
      user = user.get({ plain: true });

      delete user.password;
      delete user.otp;

      /* =======================
         9️⃣ Final Response
      ======================= */
      return helper.success(
        res,
        isSignup
          ? "Signup successful"
          : "Login successful",
        {
          ...user,
          token,
          isSignup,
        }
      );

    } catch (error) {

      console.error("Social Login Error:", error);

      return helper.error(res, error);
    }
  },

  fileUpload: async (req, res) => {
    try {
      let folder = "users";
      let fileData = null;

      if (req.files && req.files.file) {
        fileData = await helper.fileUpload(req.files.file, folder);
      } else {
        return helper.failed(res, "No file uploaded");
      }

      return helper.success(res, "File uploaded successfully", {
        file: fileData,
      });
    } catch (error) {
      console.log(error);

      return helper.error(res, "Error occurred during file upload");
    }
  },
  ////////
  notification_off_on: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        is_notification: "required|in:on,off", //0=>off,1=>on
      });

      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) return helper.failed(res, errorsResponse);

      const update = await users.update(req.body, {
        where: {
          id: req.auth.id,
        },
        raw: true,
      });
      let updateduser = await users.findOne({
        where: {
          id: req.auth.id,
        },
        raw: true,
        nest: true,
      });
      updateduser.password = undefined;
      updateduser.otp = undefined;
      return helper.success(res, "Notification setting updated successfully", updateduser);
    }
    catch (error) {
      return helper.error(res, error);
    }
  },

  location_update: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        latitude: "required",
        longitude: "required"
      });

      let errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) return helper.failed(res, errorsResponse);

      const update = await users.update(req.body, {
        where: {
          id: req.auth.id,
        },
        raw: true,
      });
      let updateduser = await users.findOne({
        where: {
          id: req.auth.id,
        },
        raw: true,
        nest: true,
      });
      updateduser.password = undefined;
      updateduser.otp = undefined;
      return helper.success(res, "Profile Updated Succesfully", updateduser);
    }
    catch (error) {
      return helper.error(res, error);
    }
  },
  get_cms: async (req, res) => {
    try {
      const pageType = req.query.type;

      const cmsData = await cms.findOne({
        where: { type: pageType },
      });

      if (!cmsData) {
        return helper.failed(res, "CMS page not found");
      }

      return helper.success(res, "CMS page retrieved successfully", cmsData);
    } catch (error) {
      return helper.error(res, error.message);
    }
  },
  contact_support: async (req, res) => {
    return helper.success(res, "Support request received");
  },
  notifications_list: async (req, res) => {
    try {

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      const whereCondition = {
        [Op.or]: [
          { reciver_id: req.auth.id },
          {
            reciver_id: 0,
            type: req.auth.role === 'driver' ? 2 : 0
          }
        ]
      };

      const { count, rows } = await notifications.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: users,
            as: "senderName",
            attributes: ["id", "name", "profileImage"]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true // 🔥 important when using include
      });

      return helper.success(
        res,
        "Notifications list fetched successfully",
        {
          total: count,
          page,
          limit,
          total_pages: Math.ceil(count / limit),
          data: rows
        }
      );

    } catch (error) {
      console.error("Error in notifications_list:", error);
      return helper.error(res, error.message || "Internal server error");
    }
  },
  clear_notification: async (req, res) => {
    try {

      await notifications.destroy({
        where: {
          reciver_id: req.auth.id
        }
      });

      return helper.success(res, "Notification deleted");

    } catch (error) {
      console.log(error);
      return helper.error(res, error);
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        email: "required|email",
      });

      const errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) return helper.failed(res, errorsResponse);

      const { email } = req.body;

      const user = await users.findOne({ where: { email } });
      if (!user) {
        return helper.failed(res, "Email not registered");
      }

      // 🔹 Generate token
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = moment().add(30, "minutes").toDate();

      // 🔹 Save token
      await users.update(
        {
          resetToken: token,
          resetTokenExpiry: expiry
        },
        { where: { id: user.id } }
      );

      // 🔹 Reset password link
      const resetLink = `${envfile.BASE_URL}reset_password_page?token=${token}`;

      const emailSubject = "Reset Your ParkEZ Account Password";

      const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Password Reset</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
          <tr>
            <td align="center">
      
              <table width="100%" max-width="600px" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);padding:30px;">
      
                <!-- Logo / Header -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <h2 style="color:#2c3e50;margin:0;">ParkEZ</h2>
                    <p style="color:#888;margin-top:5px;">Secure Account Access</p>
                  </td>
                </tr>
      
                <!-- Content -->
                <tr>
                  <td style="color:#333;font-size:15px;line-height:1.6;">
                    <p>Hello <strong>${user.name || "User"}</strong>,</p>
      
                    <p>
                      We received a request to reset your password for your ParkEZ account.
                      Click the button below to set a new password.
                    </p>
      
                    <p style="text-align:center;margin:30px 0;">
                      <a href="${resetLink}"
                        style="background:#4F46E5;color:#ffffff;text-decoration:none;
                        padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">
                        Reset Password
                      </a>
                    </p>
      
                    <p>
                      This password reset link will expire in
                      <strong>30 minutes</strong>.
                    </p>
      
                    <p>
                      If you did not request a password reset, please ignore this email
                      or contact our support team.
                    </p>
      
                    <p style="margin-top:30px;">
                      Regards,<br/>
                      <strong>ParkEZ Team</strong>
                    </p>
                  </td>
                </tr>
      
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top:20px;color:#999;font-size:12px;">
                    © ${new Date().getFullYear()} MyRyd. All rights reserved.
                  </td>
                </tr>
      
              </table>
      
            </td>
          </tr>
        </table>
      
      </body>
      </html>
      `;


      await helper.sendEmail(email, emailSubject, emailBody);
      return helper.success(
        res,
        "Password reset link sent to your registered email"
      );

    } catch (error) {
      console.error(error);
      return helper.error(res, error);
    }
  },
  resetPasswordPage: async (req, res) => {
    try {
      let token = req.query.token

      res.render("reset_password", { token });

    } catch (err) {
      console.error(err);
      res.render("reset-password", {
        error: "Something went wrong. Please try again."
      });
    }
  },
  resetPassword: async (req, res) => {
    try {

      const v = new Validator(req.body, {
        token: "required",
        password: "required",
      });

      const errorsResponse = await helper.checkValidation(v);
      if (errorsResponse) return helper.failed(res, errorsResponse);

      const { token, password } = req.body;

      const user = await users.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        res.render("expired", {});
      }

      // 🔹 Encrypt password with CryptoJS AES
      const secretKey = envfile.crypto_key || envfile.encrypt_sec_key || 'dealconect@2026!!';
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

      // 🔹 Update password
      await users.update(
        {
          password: encryptedPassword,
          resetToken: null,
          resetTokenExpiry: null
        },
        { where: { id: user.id } }
      );
      res.render("sucess", {});

    } catch (error) {
      console.error(error);
      return helper.error(res, error);
    }
  }
};
