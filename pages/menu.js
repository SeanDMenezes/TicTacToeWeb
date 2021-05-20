import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import styles from "../styles/menu.module.scss";

// api
import { getGames, createGame, joinGame } from "./api/games-api";
import { io } from "socket.io-client";

const clientPort = process.env.REACT_APP_API_ENDPOINT;
const socket = io(clientPort);

const Menu = () => {
    const router = useRouter();

    const [name, setName] = useState("");
    const [nameTouched, setNameTouched] = useState(false);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");
    
    const handleStart = async () => {
        if (name === "") {
            setNameTouched(true);
            return;
        }
        let res = await createGame(name);
        if (res) {
            if (!res.error) {
                socket.emit("startGame", name);
                socket.disconnect();
                router.push({ pathname: "/tictactoe", query: { gameID: res._id, player: name } });
            } else {
                setCodeError(res.error.toString());
            }
        } else {
            setCodeError("Something went wrong...");
        }
    }

    const handleJoin = async () => {
        if (name === "") {
            setNameTouched(true);
            return;
        }
        
        socket.emit("joinGame", code, name);
    }

    useEffect(() => {
        console.log(process.env.REACT_APP_API_ENDPOINT);

        socket.on("playerJoined", (game) => {
            if (game) {
                if (!game.error) {
                    socket.disconnect();
                    router.push({ pathname: "/tictactoe", query: { gameID: game._id, player: game.player2.name } });
                } else {
                    setCodeError(game.error.toString());
                }
            } else {
                setCodeError("Something went wrong...");
            }
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    return (
        <div>
            <div className={styles.gameTitle}>
                Tic Tac Toe
            </div>
            <div className={styles.inputNameContainer}>
                <input
                    className={styles.inputName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    placeholder="Enter username"
                />
                {name === "" && nameTouched &&
                    <div className={styles.fieldError + " pl-2"}>
                        Please enter a username
                    </div>
                }
            </div>
            <Button onClick={handleStart} className={styles.startButton}>
                Start New Lobby
            </Button>
            <span className="text-center d-block mt-4"> OR </span>
            <div className={styles.inputCodeContainer + " mt-4"}>
                <div className="ml-auto">
                    <input
                        className={styles.inputCode}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                    />
                    {codeError !== "" &&
                        <div className={styles.fieldError + " pl-2 position-absolute"} style={{ width: "15%" }}>
                            {codeError}
                        </div>
                    }
                </div>
                
                <Button onClick={handleJoin} className={styles.joinButton}>
                    Join Lobby
                </Button>
            </div>
        </div>
    )

};

export default Menu;
