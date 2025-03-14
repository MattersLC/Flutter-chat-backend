/*
    path: api/chats
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getChats, pinChat, unpinChat } = require('../controllers/chats');
const router = Router();

router.get('/', validarJWT, getChats);
router.post('/pin-chat', validarJWT, pinChat);
router.post('/unpin-chat', validarJWT, unpinChat);

module.exports = router;