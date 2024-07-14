const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { serialize } = require('v8');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create table for images if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image BLOB
        )
    `);
});

// Insert image
function insertImage(imagePath, callback) {
    fs.readFile(imagePath, (err, data) => {
        if (err) {
            return callback(err);
        }
        db.run('INSERT INTO images (image) VALUES (?)', [data], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.lastID);
        });
    });
}

// Retrieve image by ID
function getImageById(id, callback) {
    db.get('SELECT image FROM images WHERE id = ?', [id], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row.image);
    });
}

// Delete all images
function deleteImages(callback) {
    db.run('DROP TABLE IF EXISTS images;', callback);
}

module.exports = {
    insertImage,
    getImageById,
    deleteImages,
    
};
