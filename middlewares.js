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

module.exports = {requireAuth,checkSession};