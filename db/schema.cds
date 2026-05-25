namespace my.chocolatesexy;

entity Temporadas {
    key id          : Integer;
    temporada       : String(10);
}

entity Campos {
    key id          : Integer;
    nombreCampo     : String(200);
    enlaceCampo     : String(1000);
}

entity Equipos {
    key id          : Integer;
    temporadaId     : Integer;
    temporada       : Association to Temporadas on temporada.id = temporadaId;
    nombre          : String(100);
    iniciales       : String(5);
}

entity Jugadores {
    key id              : Integer;
    nombreCamiseta      : String(100);
    dorsal              : Integer;
    nombre              : String(100);
    apellidos           : String(100);
    fechaNacimiento     : Date;
    piernaHabil         : String(20);
    posicion            : String(50);
    foto                : String(500);
}

entity Jornadas {
    key id              : Integer;
    temporadaId         : Integer;
    temporada           : Association to Temporadas on temporada.id = temporadaId;
    jornada             : Integer;
    equipoId            : Integer;
    equipo              : Association to Equipos on equipo.id = equipoId;
    esLocal             : Boolean;
    fecha               : DateTime;
    campoId             : Integer;
    campo               : Association to Campos on campo.id = campoId;
    golesNuestros       : Integer;
    golesRival          : Integer;
    resultado           : String(20);
}

entity Clasificaciones {
    key id              : Integer;
    temporadaId         : Integer;
    temporada           : Association to Temporadas on temporada.id = temporadaId;
    equipoId            : Integer;
    equipo              : Association to Equipos on equipo.id = equipoId;
    jornada             : Integer;
    puntos              : Integer;
    partidosGanados     : Integer;
    partidosEmpatados   : Integer;
    partidosPerdidos    : Integer;
    golesAFavor         : Integer;
    golesEnContra       : Integer;
}

entity JornadaJugadores {
    key id          : Integer;
    jornadaId       : Integer;
    jornada         : Association to Jornadas  on jornada.id  = jornadaId;
    jugadorId       : Integer;
    jugador         : Association to Jugadores on jugador.id  = jugadorId;
    esTitular       : Boolean default false;
    esMVP           : Boolean default false;
}

entity Goles {
    key id                  : Integer;
    jornadaId               : Integer;
    jornada                 : Association to Jornadas  on jornada.id = jornadaId;
    jugadorId               : Integer;
    jugador                 : Association to Jugadores on jugador.id = jugadorId;
    asistenciaJugadorId     : Integer;
    asistencia              : Association to Jugadores on asistencia.id = asistenciaJugadorId;
    minuto                  : Integer;
    esPenalti               : Boolean default false;
    esPropio                : Boolean default false;
}

entity GolesRival {
    key id          : Integer;
    jornadaId       : Integer;
    jornada         : Association to Jornadas on jornada.id = jornadaId;
    minuto          : Integer;
    esPropio        : Boolean default false; 
}

entity Tarjetas {
    key id          : Integer;
    jornadaId       : Integer;
    jornada         : Association to Jornadas  on jornada.id  = jornadaId;
    jugadorId       : Integer;
    jugador         : Association to Jugadores on jugador.id  = jugadorId;
    minuto          : Integer;
    esAmarilla      : Boolean default false;
    esRoja          : Boolean default false;
}

entity Noticias {
    key id        : Integer;
    fecha         : DateTime;
    tipo          : String(20);     
    titulo        : String(200);
    subtitulo     : String(500);
    contenido     : LargeString;     
    foto          : String(500);    
}