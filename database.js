module.exports = class Database {
    constructor() {
        var Pool = require('pg-pool');
        this.pool = new Pool({ host: "localhost",
            user: "postgres",
            password: "password",
            database: "postgres",
            port: 5432,
            max: 20
        })
    }

    async registerUser(username, password){
        let conn =  this.pool;
        let result = await conn.query('Insert into Members (username, password) Values ($1, $2)' , [username, password]);
        return result.rowCount;
    }

    async fetchUser(username) {
        let conn =  this.pool;
        let result = await conn.query('SELECT * FROM Members where username = $1' , [username]);
        return result.rows[0];
    }

    async fetchUserNotes(userId) {
        let conn =  this.pool;
        let result = await conn.query('SELECT * FROM Notes where user_id = $1' , [userId]);
        return result.rows;
    }

    async fetchNote(noteId) {
        let conn =  this.pool;
        let result = await conn.query('SELECT * FROM Notes where note_id = $1' , [noteId]);
        return result.rows;
    }

    async createNote(userId, noteText) {
        let conn =  this.pool;
        let result = await conn.query('Insert into Notes (user_id, notes) Values($1, $2)' , [userId, noteText]);
        return result.rows;
    }

    async updateNote(noteId, noteText) {
        let conn =  this.pool;
        let result = await conn.query('update Notes SET notes = $1 where note_id = $2', [noteText, noteId]);
        return result.rows;
    }

    async deleteNote(noteId) {
        let conn =  this.pool;
        let result = await conn.query('delete from Notes where note_id = $1' , [noteId]);
        return result.rows;
    }

    close() {
        this.pool.then((pool) => pool.close());
    }
}
