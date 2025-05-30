const { User } = require('../models');
const { signToken } = require('../helpers/jwt'); // Ubah dari generateToken ke signToken

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, username } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({
          message: 'Email, password, and username are required'
        });
      }

      // Check for duplicate email first - return 400 for client error
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }

      const user = await User.create({
        email,
        password,
        username
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      // Return 500 for database/validation errors
      res.status(500).json({
        message: error.message || 'Internal server error'
      });
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required'
        });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      // Import comparePassword helper
      const { comparePassword } = require('../helpers/bcrypt');
      
      if (!comparePassword(password, user.password)) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = signToken({ id: user.id, email: user.email }); // Ubah generateToken ke signToken
      
      res.json({
        message: 'Login successful',
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username // Kembali ke username
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      res.json({
        message: 'Profil berhasil diambil',
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username, // Kembali ke username
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { username, email, password } = req.body; // Kembali ke username
      const userId = req.user.id;

      if (!username && !email && !password) {
        return res.status(400).json({
          message: 'Minimal satu field (username, email, atau password) harus diisi'
        });
      }

      const updateData = {};
      if (username) updateData.username = username; // Kembali ke username
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      await User.update(updateData, {
        where: { id: userId },
        individualHooks: true
      });

      const updatedUser = await User.findByPk(userId);

      res.json({
        message: 'Profil berhasil diperbarui',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username // Kembali ke username
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Hapus semua fusion history user terlebih dahulu
      const { FusionHistory } = require('../models');
      await FusionHistory.destroy({
        where: { userId }
      });

      // Hapus user
      await User.destroy({
        where: { id: userId }
      });

      res.json({
        message: 'Profil dan semua data terkait berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
