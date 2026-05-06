using my.chocolatesexy as my from '../db/schema';

service FootballService {
    entity Jugadores as projection on my.Jugadores;
    entity Jornadas as projection on my.Jornadas;
    entity Actuaciones as projection on my.Actuaciones;
}