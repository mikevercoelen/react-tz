# React-tz

An ultimate timezone picker for [React](https://reactjs.com). Built on top of [react-select](https://github.com/JedWatson/react-select), [moment-timezone](https://github.com/moment/moment-timezone) and using real timezone data from [timezone-db](https://timezonedb.com/) 

## Demo

[mikevercoelen.github.io/react-tz](http://mikevercoelen.github.io/react-tz/)

## Requirements

You need to make sure you have these deps installed first:

- [react](https://reactjs.com) `^16.8.6`
- [react-select](https://github.com/JedWatson/react-select) `2.4.3^`
- [moment-timezone](https://github.com/moment/moment-timezone) `2.24.0^`

## Installation

```shell
npm install react-tz --save
```

With peer deps:

```shell
npm install react react-select moment-timezone react-tz --save
```

## Example

```js
import React, { useState } from 'react'
import { TimezoneSelect } from 'react-tz'

const Demo = () => {
  const [timezone, setTimezone] = useState(null)
  
  return (
    <TimezoneSelect
      value={timezone}
      onChange={setTimezone} />
  )
}

export default Demo
```
