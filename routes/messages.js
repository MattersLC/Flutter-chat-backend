/*
    Path: /api/messages
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getChat } = require('../controllers/messages');

const router = Router();

router.get('/:from', validarJWT, getChat);

module.exports = router;