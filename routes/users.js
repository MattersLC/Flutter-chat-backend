/*
    path: api/users
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsers, uploadProfilePicture } = require('../controllers/users');
const router = Router();

router.get('/', validarJWT, getUsers);
router.post('/upload-profile-picture', validarJWT, uploadProfilePicture);
//router.post('/send-friend-request', validarJWT, sendFriendRequest);

module.exports = router;