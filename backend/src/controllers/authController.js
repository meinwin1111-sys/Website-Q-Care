const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

function signToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function toAuthUser(row) {
  return {
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    role: row.role,
  };
}

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập họ và tên." });
    }
    if (!email?.trim() || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }
    if (phone && !PHONE_RE.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại phải gồm đúng 10 chữ số." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
    }

    const existing = await userModel.findByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ message: "Email đã được đăng ký." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await userModel.createUser({
      fullName: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      passwordHash,
      role: "customer",
    });

    const token = signToken(created);
    return res.status(201).json({ token, user: toAuthUser(created) });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Không thể đăng ký. Vui lòng thử lại." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await userModel.findByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    let passwordOk = false;
    try {
      passwordOk = await bcrypt.compare(password, user.password);
    } catch {
      passwordOk = false;
    }

    if (!passwordOk) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const token = signToken(user);
    return res.json({ token, user: toAuthUser(user) });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Không thể đăng nhập. Vui lòng thử lại." });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const passwordOk = await bcrypt.compare(currentPassword, user.password);
    if (!passwordOk) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, passwordHash);

    return res.status(200).json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Không thể đổi mật khẩu. Vui lòng thử lại." });
  }
}

module.exports = { register, login, changePassword };
