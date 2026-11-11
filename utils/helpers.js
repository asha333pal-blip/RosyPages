
const sanitizeHtml = require("sanitize-html");
const Diary = require("../model/diary.js");

// Async route error handling
function wrapAsync(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}
// Entry validation
function validateEntry(title, content) {
    const t = (title || "").trim();
    const plain = sanitizeHtml(content || "", { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, " ")
        .trim();
    if (!t) return "Please add a title for your entry ✏️";
    if (t.length > 100) return "Titles can be up to 100 characters.";
    if (!plain) return "Your page is empty. Write something first 🌸";
    if (plain.length > 20000) return "This entry is too long. Please keep it under 20,000 characters.";
    return null;
}
// HTML sanitization
function cleanContent(html) {
    return sanitizeHtml(html, {
        allowedTags: ["p", "br", "strong", "em", "u", "s", "ol", "ul", "li", "span", "h1", "h2", "h3", "blockquote"],
        allowedAttributes: { "*": ["style", "class"] },
        allowedClasses: { "*": ["ql-*"] },
        allowedStyles: {
            "*": {
                color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i],
                "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\(/i]
            }
        }
    });
}
// Escape HTML characters

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
// Convert HTML into plain text
function htmlToText(html) {
    const withBreaks = html.replace(/<\/p>|<br\s*\/?>|<\/li>|<\/h[1-3]>|<\/blockquote>/gi, "\n");
    return sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
// Count words

function countWords(html) {
    const text = htmlToText(html);
    return text ? text.split(/\s+/).length : 0;
}
// Escape search regex
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// Sidebar entries
async function getSidebarEntries(journalId, q) {
    const filter = { journal: journalId };
    if (q) {
        const rx = new RegExp(escapeRegex(q), "i");
        filter.$or = [{ title: rx }, { content: rx }];
    }
    return Diary.find(filter).select("title created_at").sort({ created_at: -1 });
}
// Export all helper functions
module.exports = {
    wrapAsync,
    validateEntry,
    cleanContent,
    escapeHtml,
    htmlToText,
    countWords,
    escapeRegex,
    getSidebarEntries
};
