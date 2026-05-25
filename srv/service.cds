using my.chocolatesexy as my from '../db/schema';

service FootballService {
    entity Temporadas       as projection on my.Temporadas;
    entity Campos           as projection on my.Campos;
    entity Equipos          as projection on my.Equipos;
    entity Jugadores        as projection on my.Jugadores;
    entity Jornadas         as projection on my.Jornadas;
    entity Clasificaciones  as projection on my.Clasificaciones;
    entity JornadaJugadores as projection on my.JornadaJugadores;
    entity Goles            as projection on my.Goles;
    entity GolesRival       as projection on my.GolesRival;
    entity Tarjetas         as projection on my.Tarjetas;
    entity Noticias         as projection on my.Noticias;
}