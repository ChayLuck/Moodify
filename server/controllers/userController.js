// server/controllers/userController.js
const User = require('../models/User');

// @desc    Kullanıcı Profil Bilgilerini Getir
// @route   GET /api/users/profile/:id
const getUserProfile = async (req, res) => {
    try {
        // Kullanıcıyı ID'sine göre bul ama ŞİFRESİNİ getirme (.select('-password'))
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

module.exports = { getUserProfile };