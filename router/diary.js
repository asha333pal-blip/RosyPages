
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Journal = require("../model/journal.js");
const Diary = require("../model/diary.js");
const {isLoggedIn , loadJournal} = require("../middleware.js");
const {
    wrapAsync, validateEntry, cleanContent,escapeHtml,htmlToText,countWords,getSidebarEntries} = require("../utils/helpers.js");


// ---------- Diary ----------
// Cover
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    let journal = await Journal.findOne({ owner: req.user._id });
    if (!journal) {
        journal = await Journal.create({ name: `${req.user.name}'s Diary`, owner: req.user._id });
    }
    const count = await Diary.countDocuments({ journal: journal._id });
    res.render("cover.ejs", { journal, count });
}));

// Entries list: sabse nayi entry apne aap khul jayegi
router.get("/:journalId/entries", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    const q = (req.query.q || "").toString().trim().slice(0, 100);
    const entries = await getSidebarEntries(req.journal._id, q);

    if (entries.length) {
        const suffix = q ? `?q=${encodeURIComponent(q)}` : "";
        return res.redirect(`/diaries/${req.journal._id}/entries/${entries[0]._id}${suffix}`);
    }
    res.render("index.ejs", { journal: req.journal, entries, selected: null, words: 0, q });
}));

// New entry form
router.get("/:journalId/new", isLoggedIn, loadJournal, (req, res) => {
    res.render("new.ejs", { journal: req.journal });
});

// Create entry
router.post("/:journalId/entries", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    let { title, content, created_at } = req.body;

    const err = validateEntry(title, content);
    if (err) {
        req.flash("error", err);
        return res.redirect(`/diaries/${req.journal._id}/new`);
    }

    const saved = await new Diary({
        title: title.trim(),
        content: cleanContent(content),
        owner: req.user._id,
        journal: req.journal._id,
        created_at: created_at ? new Date(created_at) : Date.now()
    }).save();

    req.flash("success", "Your page has been saved 🌷");
    res.redirect(`/diaries/${req.journal._id}/entries/${saved._id}`);
}));

// Edit form
router.get("/:journalId/entries/:entryId/edit", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.entryId)) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }

    let diary = await Diary.findOne({ _id: req.params.entryId, journal: req.journal._id });
    if (!diary) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }
    res.render("edit.ejs", { diary, journal: req.journal });
}));

// Export entry (.txt ya .html)
router.get("/:journalId/entries/:entryId/export", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.entryId)) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }

    const diary = await Diary.findOne({ _id: req.params.entryId, journal: req.journal._id });
    if (!diary) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }

    const date = diary.created_at.toDateString();
    const safeName = diary.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "entry";

    if (req.query.format === "html") {
        const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(diary.title)}</title>
<style>
  body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #4b5563; line-height: 1.8; }
  h1 { color: #831843; margin-bottom: 4px; }
  .date { color: #ec4899; margin-bottom: 24px; }
  .ql-size-small { font-size: 0.8em; }
  .ql-size-large { font-size: 1.4em; }
  .ql-size-huge { font-size: 2em; }
  .ql-align-center { text-align: center; }
  .ql-align-right { text-align: right; }
  .ql-align-justify { text-align: justify; }
</style>
</head>
<body>
<h1>${escapeHtml(diary.title)}</h1>
<div class="date">${date}</div>
${diary.content}
</body>
</html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}.html"`);
        return res.send(page);
    }

    const text = `${diary.title}\n${date}\n\n${htmlToText(diary.content)}\n`;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.txt"`);
    res.send(text);
}));

// Ek entry padhne ka page
router.get("/:journalId/entries/:entryId", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.entryId)) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }

    const q = (req.query.q || "").toString().trim().slice(0, 100);
    const selected = await Diary.findOne({ _id: req.params.entryId, journal: req.journal._id });
    if (!selected) {
        req.flash("error", "We couldn't find that entry 🌷");
        return res.redirect(`/diaries/${req.journal._id}/entries`);
    }

    const entries = await getSidebarEntries(req.journal._id, q);
    res.render("index.ejs", {
        journal: req.journal,
        entries,
        selected,
        words: countWords(selected.content),
        q
    });
}));

// Update entry
router.put("/:journalId/entries/:entryId", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    let { title, content, created_at } = req.body;

    const err = validateEntry(title, content);
    if (err) {
        req.flash("error", err);
        return res.redirect(`/diaries/${req.journal._id}/entries/${req.params.entryId}/edit`);
    }

    const update = { title: title.trim(), content: cleanContent(content) };
    if (created_at) update.created_at = new Date(created_at);

    await Diary.findOneAndUpdate(
        { _id: req.params.entryId, journal: req.journal._id },
        update,
        { runValidators: true }
    );

    req.flash("success", "Your page has been updated ✨");
    res.redirect(`/diaries/${req.journal._id}/entries/${req.params.entryId}`);
}));

// Delete entry
router.delete("/:journalId/entries/:entryId", isLoggedIn, loadJournal, wrapAsync(async (req, res) => {
    await Diary.findOneAndDelete({ _id: req.params.entryId, journal: req.journal._id });
    req.flash("success", "Your page has been deleted 🌸");
    res.redirect(`/diaries/${req.journal._id}/entries`);
}));

module.exports = router;