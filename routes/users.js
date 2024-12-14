/*
    path: api/users
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsers } = require('../controllers/users');
const router = Router();

router.get('/', validarJWT, getUsers);
//router.post('/send-friend-request', validarJWT, sendFriendRequest);

module.exports = router;