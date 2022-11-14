export enum SocketEventServerEnumerator{
    "CONNECTION_READY" = 200,
    "TIME_UPDATE" = 201,
    "GAME_START" = 202,
    "CHALLENGER_GRID_UPDATE" = 203,
    "ALL_CHALLENGER_GRID" = 204,
    "RECEIVED_DAMAGE" = 205,
    "IN_MATCH_PLAYERS" = 206,
    "MATCH_SPEEDUP"= 207,
    "GETTING_FOCUSED"=208,
    "FOCUSING_PLAYERS"=209,
    "ATTACKED_BY"=210,
    "RECEIVE_PIECES_QUEUE"=211,
    "GET_CARD_RETURN"=212,
    "RECEIVE_CARD_FROM_ENEMY"=213,
    "DISCONNECTED_BY_SERVER" = 299
  }
  
  export enum SocketEventClientEnumerator{
    "GRID_UPDATE" = 102,
    "PIECE_GRID_UPDATE" = 103,
    "GAME_OVER" = 104,
    "AUTENTICATE" = 105,
    "GET_ENEMIES_FOCUS" = 106,
    "SEND_DAMAGE"=107,
    "SEND_CARD" = 108  
}
  