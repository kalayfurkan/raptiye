function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).redirect('/login');
    }
    next();
}

module.exports=requireAuth;