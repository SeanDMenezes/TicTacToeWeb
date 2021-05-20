import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useRouter, withRouter } from "next/router";

// components
import Grid from "../components/grid/grid";

// icons/styling
import { FaAngleLeft } from "react-icons/fa";
import styles from "./../styles/tictactoe.module.scss";

// api
import { getGame } from "./api/games-api";

import socketIOClient from "socket.io-client";

const clientPort = "http://localhost:5000/" //|| "https://lecture-lurkers.herokuapp.com/";
const socket = socketIOClient(clientPort);

const TicTacToe = () => {
    const router = useRouter();
    const currentGameID = router.query.gameID;
    const me = router.query.player;
    const socketID = socket.id;

    // const [values, setValues] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [status, setStatus] = useState("Loading...");
    const [game, setGame] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [error, setError] = useState("");

    const resetGrid = () => {
        let defaultGrid = [];
        [...Array(3)].forEach((_, i) => {
            let newRow = ["", "", ""];
            defaultGrid.push(newRow);
        });
        setValues([...defaultGrid]);
    }

    const checkWin = (curValues, player) => {
        // row check
        for (let i = 0; i < 3; ++i) {
            let row = curValues[i];
            if (row.every(val => val === player)) return true;
        }

        // column check
        for (let j = 0; j < 3; ++j) {
            let col = [curValues[0][j], curValues[1][j], curValues[2][j]];
            if (col.every(val => val === player)) return true;
        }

        // diagonal check
        let diag1 = [curValues[0][0], curValues[1][1], curValues[2][2]];
        let diag2 = [curValues[0][2], curValues[1][1], curValues[2][0]];
        if (diag1.every(val => val === player)) return true;
        if (diag2.every(val => val === player)) return true;

        return false;
    }

    const checkDraw = (curValues) => {
        // assuming there's no win con on the board
        for (let i = 0; i < 3; ++i) {
            let row = curValues[i];
            if (row.includes("")) return false;
        }

        return true;
    }

    const handleClick = (index) => {
        status === "" && me === currentPlayer.name && socket.emit("makeMove", index, values, currentPlayer.symbol, game._id);
    }

    const playAgain = () => {
        socket.emit("reset", game._id);
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
        // let res = await getGame(currentGameID);
        // if (res) {
        //     if (!res.error) {
        //         setGame(res);
        //     } else {
        //         setError(res.error.toString());
        //     }
        // } else {
        //     setError("Something went wrong...");
        // }
    }

    // player disconnect event
    useEffect(() => {
        socket.on("disconnect", () => {
            socket.emit("leaveGame", currentGameID, me);
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    // player disconnect event
    useEffect(() => {
        socket.on("playerLeft", (updatedGame) => {
            setCurrentGame(updatedGame);
        });

        // return () => {
        //     socket.disconnect();
        // }
    }, []);

    // game change event
    useEffect(() => {
        if (!game) return;
        if (!game.player1 || !game.player2) {
            setStatus("Waiting for at least 2 players to join...");
        } else {
            setCurrentPlayer((game.turnNumber + game.gameNumber)  % 2 === 0 ? game.player1 : game.player2);
            setStatus("");
        }
    }, [game]);

    useEffect(() => {
        resetGrid();
        setCurrentGame();
    }, []);

    // game win/drawn event
    useEffect(() => {
        socket.on("gameUpdated", (updatedGame, winner) => {
            setGame({ ...updatedGame });
            if (winner === "") {
                setStatus("It's a draw!")
            } else {
                setStatus(winner + " wins!");
            }
        })

        // return () => {
        //     socket.disconnect();
        // }
    }, []);

    // game reset event
    useEffect(() => {
        socket.on("gameReset", (updatedGame) => {
            setGame({ ...updatedGame });
            resetGrid();
            setGameOver(false);
            setStatus("");
        })

        // return () => {
        //     socket.disconnect();
        // }
    }, []);

    // join game event
    useEffect(() => {
        socket.on("playerJoined", (updatedGame) => {
            if (updatedGame) {
                if (!updatedGame.error) {
                    setGame(updatedGame);
                } else {
                    setError(updatedGame.error.toString());
                }
            } else {
                setError("Something went wrong...");
            }
        });

        // return () => {
        //     socket.disconnect();
        // }
    }, []);

    // move made event
    useEffect(() => {
        socket.on("moveMade", (updatedValues) => {
            setValues([...updatedValues]);
            setGame((currentGame) => { return { ...currentGame, turnNumber: currentGame.turnNumber + 1 } });
            setCurrentPlayer((player) => {
                if (checkWin(updatedValues, player.symbol)) {
                    socket.emit("gameWon", currentGameID, player.name);
                    setGameOver(true);
                }
                else if (checkDraw(updatedValues)) {
                    socket.emit("gameDrawn", currentGameID);
                    setStatus("It's a draw!");
                    setGameOver(true);
                }
                return player;
            });
        });

        // return () => {
        //     socket.disconnect();
        // }
    }, [])

    return (
        <div className={styles.gameContainer}>
            <div className="d-inline">
                <div className={styles.back} onClick={() => router.push("/")}>
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
                    values={values}
                    handleClick={handleClick}
                />
                <span className={styles.turnText}>
                    {status !== "" ? status : `It's ${currentPlayer.name}'s turn`}
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