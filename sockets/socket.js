const { io } = require('../index');
const { validateJWT } = require('../helpers/jwt');
const { userConnected, userDisconnected, saveMessage } = require('../controllers/socket');

// Mensajes de Sockets
io.on('connection', async ( client ) => {
    const [ validated, uid ] = validateJWT(client.handshake.headers['x-token']);

    // Verificamos que el cliente tenga un token válido
    if ( !validated ) { return client.disconnect(); }

    // Cliente autenticado
    userConnected( uid );

    // Ingresar al usuario a una sala específica
    client.join( uid );
    
    // Escuchar del cliente el mensaje personal
    client.on('personal-message', async ( payload ) => {
        await saveMessage(payload);
        io.to( payload.to ).emit('personal-message', payload);
    });

    // Desconectamos el cliente del servidor
    client.on('disconnect', () => {
        userDisconnected( uid );
    });

    /*client.on('mensaje', ( payload ) => {
        console.log('Mensaje', payload);

        io.emit( 'mensaje', { admin: 'Nuevo mensaje' } );

    });*/


});
