import React from "react";

import styles from "./grid.module.scss";

const Grid = ({ values, handleClick }) => {

    return (
        <div className={styles.tictactoeGrid}>
            {(values && values.length) ?
                <ul className={styles.parentCell}>
                    {values.map((row, rowIdx) => {
                        return row.map((value, colIdx) => {
                            let index = rowIdx * 3 + colIdx;
                            return (
                                <li onClick={() => handleClick(index)} className={styles.childCell} key={index}>
                                    <span className="fixed">
                                        {value !== "" && value}
                                    </span>
                                </li>
                            )
                        })
                    })}
                </ul>
            :
                <> </>
            }
        </div>
    )
}

export default Grid;