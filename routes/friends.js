/*
    path: api/friends
*/
const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getFriends, getFriendRequests, getSentFriendRequests, sendFriendRequest, getTotalFriendRequests, getTotalSentFriendRequests, respondFriendRequest, unsendFriendRequest, deleteFriend } = require('../controllers/friends');
const router = Router();

router.get('/', validarJWT, getFriends);
router.get('/friend-requests', validarJWT, getFriendRequests);
router.get('/sent-friend-requests', validarJWT, getSentFriendRequests);
router.get('/total-friend-requests', validarJWT, getTotalFriendRequests);
router.get('/total-sent-friend-requests', validarJWT, getTotalSentFriendRequests);
router.post('/send-friend-request', validarJWT, sendFriendRequest);
router.post('/unsend-friend-request', validarJWT, unsendFriendRequest);
router.post('/respond-friend-request', validarJWT, respondFriendRequest);
router.post('/delete-friend', validarJWT, deleteFriend);

module.exports = router;