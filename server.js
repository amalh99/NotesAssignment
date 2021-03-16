const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const util = require('util');
const Database = require('./database.js');
const db = new Database();

(async () => {
    let app = express()
    .set('views','views')
    .set('view engine','pug')
    .use(express.urlencoded({extended: true}))
    .use(express.json())

    
    .get('/logout', async function(req,res, next ) {  
        res.type('text/html');
        res.cookie('jwt', "", { maxAge: 0, httpOnly: true, secure: false });
        res.render('index', {title: 'Custom Note taking assignment'});
    })    

    .get('/createNote', async function(req,res, next ) {  
        res.type('text/html');
        res.render('create',{title: 'Custom Note taking assignment'});
    })

    .get('/modifyNote', async function(req,res, next ) {     
        var token = req.body.token || req.headers['authorization'] || req.headers['Authorization'] || req.headers.cookie;
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }    
            if (token.startsWith('jwt=')) {
                token = token.slice(4, token.length).trimLeft();
            } 

            jwt.verify(token, 'secretkey', async function (err, decoded) {
                if (err) {
                    console.error('JWT Verification Error', err);
                    return res.status(403).send(err);
                } else {            
                    let noteResult = await db.fetchNote(req.query.noteId);
                    res.type('text/html');
                    res.render('modify',{title: 'Custom Note taking assignment', mynote: noteResult[0]});
                    
                }
            });
        } else {
            res.status(403).send('Token not provided');
        }
    })  

    .get('/signup', function(req,res) {
        res.type('text/html');
        res.render('signup',{title: 'Custom Note Taking assignment'});
     })

    .get('/',function(req,res){
        res.type('text/html');
        res.render('index',{title: 'Custom Note taking assignment'});
    })

    .post('/createNote', async function(req,res, next ) {  
        var token = req.body.token || req.headers['authorization'] || req.headers['Authorization'] || req.headers.cookie; 
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }    
            if (token.startsWith('jwt=')) {
                token = token.slice(4, token.length).trimLeft();
            }  
            jwt.verify(token, 'secretkey', async function (err, decoded) {
                if (err) {
                    console.error('JWT Verification Error', err);
                    return res.status(403).send(err);
                } else {            
                    await db.createNote(decoded.userId, req.body.noteText);
                    let noteResult = await db.fetchUserNotes(decoded.userId);
                    res.render('notes', {title: 'Custom Note taking assignment', notes: noteResult});
                    
                }
            });
        } else {
            res.status(403).send('Token not provided');
        }
    })

    .post('/modifyNote', async function(req,res, next ) {  
        const noteId = req.body.noteId;
        const noteText = req.body.noteText;
        const actionName = req.body.actionName;

        var token = req.body.token || req.headers['authorization'] || req.headers['Authorization'] || req.headers.cookie;
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }    
            if (token.startsWith('jwt=')) {
                token = token.slice(4, token.length).trimLeft();
            }  

            jwt.verify(token, 'secretkey', async function (err, decoded) {
                if (err) {
                    console.error('JWT Verification Error', err);
                    return res.status(403).send(err);
                } else {
                    if(actionName == "Edit"){
                        await db.updateNote(noteId, noteText);
                    }else if( actionName == "Delete"){
                        await db.deleteNote(noteId);
                    }   

                    let noteResult = await db.fetchUserNotes(decoded.userId);
                    res.render('notes', {title: 'Custom Note taking assignment', notes: noteResult});
                }
            });
        } else {
            res.status(403).send('Token not provided');
        }
    })

    .use('/notes', async function(req,res, next ) {
        var token = req.body.token || req.headers['authorization'] || req.headers['Authorization'] || req.headers.cookie;
        if (token) {
            if (token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }    
            if (token.startsWith('jwt=')) {
                token = token.slice(4, token.length).trimLeft();
            }  

            jwt.verify(token, 'secretkey', async function (err, decoded) {
                if (err) {
                    console.error('JWT Verification Error', err);
                    return res.status(403).send(err);
                } else {
                    let noteResult = await db.fetchUserNotes(decoded.userId);
                    res.render('notes', {title: 'Custom Note taking assignment', notes: noteResult});
                }
            });
        } else {
            res.status(403).send('Token not provided');
        }

    })

    .post('/signup', async function (req, res, next) {

        const username = req.body.username;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        let signupFlag = false;
        let hashPassword = "";

        if(password === confirmPassword){
            hashPassword = bcrypt.hashSync(req.body.password, 6);
            let checkUserExist = await db.fetchUser(username);
            if(!checkUserExist || checkUserExist == undefined){
                signupFlag = true;
            }    
        }
        
        if(signupFlag){
            let signupResult = await db.registerUser(username, hashPassword);
            
            if (signupResult) {
                let loggedInUser = await db.fetchUser(username);
                jwt.sign({userId: loggedInUser.user_id}, 'secretkey', {expiresIn: '86400'},  (err, token) => {
                    if (err){
                        res.status(500).send('Error creating token.')
                    }
                    res.cookie('jwt', token, { httpOnly: true, secure: false });
                    res.setHeader('Authorization', 'Bearer '+ token);
                    res.type('text/html');
                    res.redirect('/notes');
                    //res.render('notes', {title: 'Custom Note taking assignment', notes:[] });
                })
            }
            else {
                res.render('index', {title: 'Custom Note taking assignment', error: "Error signing up user."});
            }
        }else{
            res.render('index', {title: 'Custom Note taking assignment', error: "Error signing up user."});
        }
    })

    .post('/', async (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        let loggedInUser = await db.fetchUser(username);
        let passwordMatch = await bcrypt.compare(password,loggedInUser.password);

        if(passwordMatch){
            //let noteResult = await db.fetchUserNotes(loggedInUser.user_id);
        
            jwt.sign({userId: loggedInUser.user_id}, 'secretkey', {expiresIn: '86400'},  (err, token) => {
                if (err){
                    res.status(500).send('Error creating token.')
                }
                res.cookie('jwt', token, { httpOnly: true, secure: false });
                res.setHeader('Authorization', 'Bearer '+ token);
                res.type('text/html');
                res.redirect('/notes');
                //res.redirect('notes', {title: 'Custom Note taking assignment', notes: noteResult});
            })

        }
        else {
            res.render('index', {title: 'Custom Note taking assignment', error: "Error Signing in."});
        }           
    })

    .use((req,res,next)=>{
        res.type('text/plain');
        res.status(404);
        res.send('404 Error - Resource Not Found...')
    })

    .listen(3300, (req, res) =>{
        console.log('Server started on port 3300');
    })

})();