/*
    path: api/users
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsers, sendFriendRequest } = require('../controllers/users');
const router = Router();

router.get('/', validarJWT, getUsers);
router.post('/send-friend-request', validarJWT, sendFriendRequest);

module.exports = router;