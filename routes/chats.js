/*
    path: api/chats
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getChats } = require('../controllers/chats');
const router = Router();

router.get('/', validarJWT, getChats);

module.exports = router;