# RosyPages 🌸

A pink, aesthetic online diary where every user gets their own private journal.
Write, edit, search, and export your pages from anywhere.

Live Demo: https://rosypages.onrender.com

## Features
- Sign up / sign in with Passport.js (passwords are hashed and salted)
- Private diary for every user, with a book-style cover
- Rich text editor (Quill): bold, italic, colours, lists, alignment, sizes
- Create, edit and delete entries with a custom entry date
- Live word count and search across all your pages
- Print an entry, or export it as .txt / .html
- Server-side validation, HTML sanitization (XSS protection), flash messages
- Responsive, pink-themed UI with a custom landing page

## Tech Stack
Node.js, Express.js, MongoDB (Mongoose), EJS, Passport.js,
express-session, Quill, sanitize-html, connect-flash, HTML/CSS/JavaScript

## Run Locally
1. `git clone https://github.com/asha333pal-blip/RosyPages/new/main?filename=README.md `
2. `npm install`
3. Create a `.env` file:
