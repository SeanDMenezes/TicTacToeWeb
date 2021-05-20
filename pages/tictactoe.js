import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useRouter, withRouter } from "next/router";

// components
import Grid from "../components/grid/grid";
import PlayerList from "../components/playerList/playerList";
import GameLog from "../components/gameLog/gameLog";

// icons/styling
import { FaAngleLeft } from "react-icons/fa";
import styles from "./../styles/tictactoe.module.scss";

// api
import { getGame } from "./api/games-api";

import socketIOClient from "socket.io-client";

const clientPort = process.env.REACT_APP_API_ENDPOINT;
const socket = socketIOClient(clientPort);

const TicTacToe = () => {
    const router = useRouter();
    const currentGameID = router.query.gameID;
    const me = router.query.player;

    // const [currentPlayer, setCurrentPlayer] = useState(null);
    const [status, setStatus] = useState("Loading...");
    const [game, setGame] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [error, setError] = useState("");

    const handleClick = (index) => {
        status === "" && me === game.currentPlayer.name && socket.emit("makeMove", currentGameID, index, game.currentPlayer.symbol);
    }

    const playAgain = () => {
        socket.emit("reset", currentGameID);
    }

    const handlePlayerClick = (playerName) => {
    }

    const setCurrentGame = (updatedGame) => {
        if (updatedGame) {
            if (!updatedGame.error) {
                setGame(updatedGame);
            } else {
                setError(updatedGame.error.toString());
            }
        } else {
            setError("Something went wrong...");
        }
    }
    
    const getCurrentGame = async () => {
        let res = await getGame(currentGameID);
        setCurrentGame(res);
    }

    const handleSubmit = (message) => {
        socket.emit("sendGlobalMessage", currentGameID, message, router.query.player);
    }

    useEffect(() => {
        getCurrentGame();
    }, []);

    // game change event
    useEffect(() => {
        if (!game) return;
        if (!game.player1 || !game.player2) {
            setStatus("Waiting for at least 2 players to join...");
        } else {
            setStatus("");
        }
    }, [game]);

    // game win/drawn event
    useEffect(() => {
        socket.on("gameUpdated", (updatedGame) => {
            setCurrentGame(updatedGame);
        });
        
        socket.on("eventLogged", (updatedGame) => {
            setCurrentGame(updatedGame);
        });
        
        socket.on("gameReset", (updatedGame) => {
            setCurrentGame(updatedGame);
            setGameOver(false);
        });
        
        socket.on("playerJoined", (updatedGame) => {
            setCurrentGame(updatedGame);
        });

        socket.on("moveMade", (updatedGame) => {
            setCurrentGame(updatedGame);
            if (updatedGame.gameWon) {
                socket.emit("gameWon", currentGameID, updatedGame.winner);
                setGameOver(true);
            }
            else if (updatedGame.gameDrawn) {
                socket.emit("gameDrawn", currentGameID);
                setGameOver(true);
            }
        });
    }, []);

    let statusView;
    if (gameOver) {
        if (game.gameWon) {
            statusView = `${game.winner} won!`;
        } else {
            statusView = "It's a draw!";
        }
    } else if (status !== "") {
        statusView = status;
    } else {
        statusView = `It's ${game.currentPlayer.name}'s turn`;
    }

    return (
        <div className={styles.gameContainer}>
            <div className="d-inline">
                
                <div style={{ float: "right", marginLeft: "-400px" }}>
                    <PlayerList
                        currentUserName={me}
                        players={game ? [game.player1, game.player2] : []}
                        spectators={game ? game.spectators : []}
                        onClick={handlePlayerClick}
                    />
                    <GameLog
                        logs={game?.logs || []}
                        handleSubmit={handleSubmit}
                    />
                </div>

                <div className={styles.back} onClick={() => { socket.disconnect(); router.push("/"); }}>
                    <FaAngleLeft className="mt-1"/>
                    Back
                </div>

                <div className={styles.gameTitle}>
                    Tic Tac Toe
                </div>
            </div>

            <div className={styles.joinID}>
                {`Lobby ID: ${game?.joinID}`} 
            </div>
            
            <div className={styles.gameGrid + " text-center"}>
                <Grid 
                    values={game?.board || [["", "", ""], ["", "", ""], ["", "", ""]]}
                    handleClick={handleClick}
                />
                <span className={styles.turnText}>
                    {statusView}
                    {/* {status !== "" ? status : `It's ${game?.currentPlayer.name}'s turn`} */}
                </span>
                {gameOver ?
                    <Button onClick={playAgain} className={styles.turnButton}>
                        Play Again
                    </Button>
                    :
                    <> </>
                }
            </div>
        </div>
    )
}

// maintains query value from router
export async function getServerSideProps(context) {
    return {
        props: {}, // will be passed to the page component as props
    };
}

export default withRouter(TicTacToe);
