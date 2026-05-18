using my.chocolatesexy as my from '../db/schema';

service FootballService {
    entity Temporadas   as projection on my.Temporadas;
    entity Campos       as projection on my.Campos;
    entity Equipos      as projection on my.Equipos;
    entity Jugadores    as projection on my.Jugadores;
    entity Jornadas     as projection on my.Jornadas;
}
