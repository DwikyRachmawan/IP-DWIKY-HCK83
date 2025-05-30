require("dotenv").config();
const { User } = require("../models");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

module.exports = class GoogleAuthController {
  static async googleLogin(req, res, next) {
    try {
      const { id_token } = req.body;

      // Verifikasi token dari Google
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.client_id, // pastikan client_id sesuai
      });

      const payload = ticket.getPayload();

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        // Buat user baru jika belum ada
        const newUser = await User.create({
          username: payload.email.split('@')[0], // ✅ username otomatis dari email
          email: payload.email,
          password: Math.random().toString(36).slice(-8) // ✅ password random
        });

        const access_token = signToken({ id: newUser.id });
        return res.status(201).json({
          message: "User berhasil dibuat dan login",
          access_token
        });
      }

      // Login user yang sudah ada
      const access_token = signToken({ id: user.id });
      res.status(200).json({
        message: "Login berhasil",
        access_token
      });
    } catch (err) {
      console.error("Error Google Login:", err);
      next(err);
    }
  }
};
