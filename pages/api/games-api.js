import { get, post, BASE_URL } from "./api-helper";

export const getGames = async () => {
    return get('api/ttt/getgames');
}

export const getGame = async (gameID) => {
    return get('api/ttt/getgame/' + gameID);
}

export const createGame = async (playerName) => {
    let values = { playerName };
    return post(values, 'api/ttt/creategame');
}

export const joinGame = async (joinID, playerName) => {
    let values = { joinID, playerName };
    return post(values, 'api/ttt/joingame')
}

