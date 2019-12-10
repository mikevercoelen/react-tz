import React, { useState } from 'react'
import { TimezoneSelect } from '../../../src'
import styles from './App.scss'

const App = () => {
  const [timezone, setTimezone] = useState(null)

  return (
    <div className={styles.component}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>
            react-tz
          </h1>
          <p>
            A simple, beautiful timezone selector.
          </p>
        </div>
        <div className={styles.selector}>
          <TimezoneSelect
            onChange={setTimezone}
            value={timezone}
          />
        </div>
      </div>
    </div>
  )
}

export default App
