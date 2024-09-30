const Message = require('./models/messageSchema');
const User = require('./models/userSchema');

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).redirect('/login');
    }
    next();
}

function checkSession(req, res, next) {
    if (req.session.userId) {
        res.locals.user = req.session.userId; // Tüm view'lara user bilgisini gönder
    } else {
        res.locals.user = null; // Oturum yoksa user null olsun
    }
    next(); // Sonraki middleware ya da route'ye geç
}

async function isThereNotification(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                const notificationMessages = await Message.find({ notification: user._id });
            
                    res.locals.hasNotification = notificationMessages.length;
                
            }
        } catch (error) {
            console.error('User fetch error:', error);
        }
    }
    next();
}

module.exports = { requireAuth, checkSession, isThereNotification };