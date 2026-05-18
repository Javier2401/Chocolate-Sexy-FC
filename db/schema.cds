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
    posesion            : Integer;
    tiros               : Integer;
    corners             : Integer;
    amarillas           : Integer;
    rojas               : Integer;
    mvpNombre           : String(100);
    mvpPosicion         : String(50);
    mvpRating           : Decimal(3,1);
}
