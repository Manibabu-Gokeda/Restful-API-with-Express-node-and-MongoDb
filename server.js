const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConfig = require('./config/databse.config.js');
const Note = require('./app/models/note.model.js'); // Ensure correct import

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

// Connect to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.error('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        "message": "Welcome to the EasyNotes application. Take notes quickly. Organize and keep track of all your notes."
    });
});

// GET route to fetch all notes
app.get('/notes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            message: 'An error occurred while fetching the notes',
            error: error.message
        });
    }
});

// POST route to create a new note
app.post('/notes', async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).send({
                message: "Note title cannot be empty"
            });
        }

        const note = new Note({
            title: req.body.title,
            content: req.body.content || "No content"
        });

        const savedNote = await note.save();
        res.status(201).json(savedNote);

    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            message: 'An error occurred while creating the note',
            error: error.message
        });
    }
});

// GET route to fetch a specific note by ID
app.get('/notes/:id', async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            message: 'An error occurred while fetching the note',
            error: error.message
        });
    }
});

// PUT route to update a specific note by ID
app.put('/notes/:id', async (req, res) => {
    try {
        const noteId = req.params.id;
        const updatedNote = await Note.findByIdAndUpdate(noteId, req.body, { new: true });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            message: 'An error occurred while updating the note',
            error: error.message
        });
    }
});

// DELETE route to delete a specific note by ID
app.delete('/notes/:id', async (req, res) => {
    try {
        const noteId = req.params.id;
        const deletedNote = await Note.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the note',
            error: error.message
        });
    }
});

// Start the server
const port = 3000;
app.listen(port, (err) => {
    if (err) {
        console.error(`Failed to start server: ${err}`);
    } else {
        console.log(`Server is listening on port ${port}`);
    }
});
