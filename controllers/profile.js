const { response } = require('express');
const User = require('../models/user');

const changePhoto = async (req, res = response ) => {
    console.log('entrando en changePhoto');
    // Recibimos valores
    const { newPhoto } = req.body;

    try {
        const currentUser = await User.findById(req.uid);

        if (!currentUser) {
            return res.status(404).json({
                ok: false,
                msg: 'User not found'
            });
        }

        // Actualizamos la nueva url en la foto
        currentUser.profilePicture = newPhoto;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'profile picture updated'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating photo' });
    }
}

const changeName = async ( req, res = response ) => {
    // Recibimos valores
    const { newName } = req.body;
    const fromUserId = req.uid; // Current logged-in user

    try {
        console.log(req.uid);
        console.log(fromUserId);
        // Obtenemos el usuario actual
        const currentUser = await User.findById(req.uid);

        if (!currentUser) {
            return res.status(404).json({
                of: false,
                msg: 'User not found'
            });
        }

        // Actualizamos el nuevo nombre
        currentUser.name = newName;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'update completed'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating name' });
    }
}

const changeLastName = async ( req, res = response ) => {
    // Recibimos valores
    const { newLastName } = req.body;

    try {
        // Obtenemos el usuario actual
        const currentUser = await User.findById(req.uid);

        if (!currentUser) {
            return res.status(404).json({
                of: false,
                msg: 'User not found'
            });
        }

        // Actualizamos el nuevo apellido
        currentUser.lastName = newLastName;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'update completed'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating last name' });
    }
}

const changeUserName = async ( req, res = response ) => {
    // Recibimos valores
    const { newUserName } = req.body;

    try {
        // Obtenemos el usuario actual
        const currentUser = await User.findById(req.uid);
        if (!currentUser) {
            return res.status(404).json({
                of: false,
                msg: 'User not found'
            });
        }

        // Validar que no exista el nombre de usuario
        const userNameExists = await User.findOne({ newUserName });
        if ( userNameExists ) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe este nombre de usuario'
            });
        }

        // Actualizamos el nuevo nombre de usuario
        currentUser.userName = newUserName;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'update completed'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating user name' });
    }
}

const changeAbout = async ( req, res = response ) => {
    // Recibimos valores
    const { newDescription } = req.body;

    try {
        // Obtenemos el usuario actual
        const currentUser = await User.findById(req.uid);

        if (!currentUser) {
            return res.status(404).json({
                of: false,
                msg: 'User not found'
            });
        }

        // Actualizamos la nueva descripción
        currentUser.about = newDescription;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'update completed'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating about' });
    }
}

const changeEmail = async ( req, res = response ) => {
    // Recibimos valores
    const { newEmail } = req.body;

    try {
        // Obtenemos el usuario actual
        const currentUser = await User.findById(req.uid);
        if (!currentUser) {
            return res.status(404).json({
                of: false,
                msg: 'User not found'
            });
        }

        // Validar que no exista el nombre de usuario
        const emailExists = await User.findOne({ newEmail });
        if ( emailExists ) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email ya fue registrado'
            });
        }

        // Actualizamos el nuevo nombre de usuario
        currentUser.email = newEmail;
        await currentUser.save();

        res.json({
            ok: true,
            msg: 'update completed'
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'An error occurred while updating email' });
    }
}

module.exports = {
    changePhoto,
    changeName,
    changeLastName,
    changeUserName,
    changeAbout,
    changeEmail,
}