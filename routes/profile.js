/*
    path: api/profile
*/
const { Router } = require('express');
const { check } = require('express-validator');
const profileController = require('../controllers/profile');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const router = Router();

router.post('/change-photo', [
    check('newPhoto', 'La URL es obligatoria').not().isEmpty(),
    validarCampos,
], validarJWT, profileController.changePhoto);

router.post('/change-name', [
    check('newName', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos,
], validarJWT, profileController.changeName);

router.post('/change-lastname', [
    check('newLastName', 'El apellido es obligatorio').not().isEmpty(),
    validarCampos,
], validarJWT, profileController.changeLastName);

router.post('/change-username', [
    check('newUserName', 'El nombre de usuario es obligatorio').not().isEmpty(),
    validarCampos,
], validarJWT, profileController.changeUserName);

router.post('/change-about', [
    check('newDescription', 'La descripción es obligatoria').not().isEmpty(),
    validarCampos,
], validarJWT, profileController.changeAbout);

module.exports = router;