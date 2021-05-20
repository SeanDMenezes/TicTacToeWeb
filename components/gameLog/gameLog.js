import React, { useEffect, useState } from "react";

import styles from "./gameLog.module.scss";

const GameLog = ({ logs, handleSubmit }) => {
    const [message, setMessage] = useState([]);

    const onSubmit = () => {
        handleSubmit(message);
        setMessage("");
    }

    useEffect(() => {
        let objDiv = document.getElementById("messageContainer");
        objDiv.scrollTop = objDiv.scrollHeight;
    }, [logs]);

    return (
        <div className={styles.logContainer}>
            <div className={styles.logMessageContainer} id="messageContainer">
                {logs.map((log, index) => {
                    if (log.author === "SYSTEM") {
                        return (
                            <div className={styles.logMessageSystem} key={index}>
                                {`[${log.author}]: ${log.content}`}
                            </div>
                        )
                    } else {
                        return (
                            <div className={styles.logMessage} key={index}>
                                {`${log.author}: ${log.content}`}
                            </div>
                        )
                    }
                    
                })}
            </div>
            <input
                className={styles.inputField}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onSubmit={onSubmit}
                onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
                type="text"
                placeholder="Send a message"
            />
        </div>
    )
};

export default GameLog;
