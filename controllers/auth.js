const { response } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async ( req, res = response ) => {
    // Recibimos valores
    const { email, password } = req.body;

    try {
        // Validar que no exista el email
        const emailExists = await User.findOne({ email });
        if ( emailExists ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        // Creamos un objeto de tipo usuario
        const user = new User( req.body );

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync( password, salt );

        // Guardar usuario en la bd
        await user.save();

        // Generamos un JWT
        const token = await generarJWT( user.id );

        // Mostramos usuario guardado
        res.json({
            ok: true,
            user,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        });
    }
}

const login = async ( req, res = response ) => {
    // Recibimos valores
    const { email, password } = req.body;

    try {
        // Validamos que exista el email
        const dbUser = await User.findOne({ email });
        if ( !dbUser ) {
            return res.status(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        // Validamos la contraseña
        const validPassword = bcrypt.compareSync( password, dbUser.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña inválida'
            });
        }

        // Generamos el JWT
        const token = await generarJWT( dbUser.id );

        // Mostramos usuario guardado
        res.json({
            ok: true,
            user: dbUser,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        });
    }
}

const renewToken = async ( req, res = response ) => {
    // Obtenemos el uid del usuario
    const uid = req.uid;

    // Generamos un nuevo JWT
    const token = await generarJWT( uid );

    // Obtenemos el usuario
    const dbUser = await User.findById( uid );

    res.json({
        ok: true,
        user: dbUser,
        token
    });
}

module.exports = {
    crearUsuario,
    login,
    renewToken
}