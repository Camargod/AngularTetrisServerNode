export enum SocketEventServerEnumerator{
    "CONNECTION_READY" = 200,
    "TIME_UPDATE" = 201,
    "GAME_START" = 202,
    "CHALLENGER_GRID_UPDATE" = 203,
    "ALL_CHALLENGER_GRID" = 204,
    "RECEIVED_DAMAGE" = 205,
    "IN_MATCH_PLAYERS" = 206,
    "DISCONNECTED_BY_SERVER" = 299  
}

export enum SocketEventClientEnumerator{
    "GRID_UPDATE" = 102,
    "PIECE_GRID_UPDATE" = 103,
    "GAME_OVER" = 104,
    "AUTENTICATE" = 105
}