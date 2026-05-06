namespace my.chocolatesexy;

entity Jugadores {
    key ID              : Integer;
    nombre              : String(100);
    apellido            : String(100);
    dorsal              : Integer;
    posicion            : String(50);
    fechaNacimiento     : Date;
    actuaciones         : Association to many Actuaciones on actuaciones.jugador_ID = ID;
}

entity Jornadas {
    key ID        : Integer;
    numero        : Integer;
    temporada     : String(20);
    actuaciones   : Association to many Actuaciones on actuaciones.jornada_ID = ID;
}

entity Actuaciones {
    key ID          : Integer;
    jugador_ID      : Integer;
    jornada_ID      : Integer;
    convocado       : Boolean;
    titular         : Boolean;
    goles           : Integer;
    asistencias     : Integer;
    tarjeta         : String(10);
}