const Journal = require("./model/journal.js");


//login check
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please sign in to continue 🌸");
        return res.redirect("/signin");
    }
    next();
}

// Journal check
async function loadJournal(req, res, next) {
    try {
        const journal = await Journal.findOne({
            _id: req.params.journalId,
            owner: req.user._id
        });
        if (!journal) {
            req.flash("error", "We couldn't find that diary 🌷");
            return res.redirect("/diaries");
        }
        req.journal = journal;
        next();
    } catch (e) {
        req.flash("error", "We couldn't find that diary 🌷");
        res.redirect("/diaries");
    }
}
module.exports = { isLoggedIn, loadJournal };