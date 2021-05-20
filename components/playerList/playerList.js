import React from "react";

import styles from "./playerList.module.scss"

const Users = ({ currentUserName, users, header, onClick }) => {
    return (
        <div className={styles.userList}>
            <div className={styles.userHeader}>
                {header}
            </div>
            {users.map(user => {
                if (user) {
                    return (
                        <div onClick={() => onClick(user.name)}>
                            <span className={styles.userName + " " + (currentUserName === user.name ? "" : styles.pointer)}>
                                {user.name}
                            </span>
                            {`: ${user.wins}W ${user.losses}L ${user.draws}D`}
                        </div>
                    )
                } else {
                    return <> </>
                }
            })}
        </div>
    )
}

const PlayerList = ({ players, spectators }) => {

    return (
        <div className={styles.playerListContainer}>
            <Users
                users={players}
                header={"Player List"}
            />

            <Users
                users={spectators}
                header={"Spectator List"}
            />
        </div>
    )
}

export default PlayerList;
