import React, {
  useState,
  useRef
} from 'react'
import PropTypes from 'prop-types'
import styles from './TimezoneSelect.scss'
import ReactSelect, {
  components,
  createFilter
} from 'react-select'
import moment from 'moment-timezone'

import timezones from '../../data/timezones.json'
import zoneToCC from '../../data/zoneToCC.json'
import CCToCountryName from '../../data/CCToCountryName.json'

import cx from 'classnames'

const has = (collection, key) => {
  return (key in collection)
}

const timezonesGroupedByCC = Object
  .entries(timezones)
  .reduce((output, [, timezoneData]) => {
    if (has(zoneToCC, timezoneData.id)) {
      const CC = zoneToCC[timezoneData.id]

      output[CC] = !output[CC] ? [] : output[CC]
      output[CC].push(timezoneData)
    }

    return output
  }, {})

const compareTimezoneGroups = (a, b) => {
  if (a.text < b.text) {
    return -1
  }

  if (a.text > b.text) {
    return 1
  }

  return 0
}

const timezoneGroups = Object
  .entries(timezonesGroupedByCC)
  .reduce((output, [CC, zonesByCountry]) => {
    output.push({
      text: CCToCountryName[CC] + ': ',
      children: zonesByCountry,
      firstNOffset: zonesByCountry[0].nOffset
    })

    return output
  }, [])
  .sort(compareTimezoneGroups)

const guessedTimezoneName = moment.tz.guess()

if (guessedTimezoneName) {
  const guessedTimezone = timezones[guessedTimezoneName]

  if (guessedTimezone) {
    timezoneGroups.splice(0, 0, {
      text: 'Local:',
      children: [
        guessedTimezone
      ],
      firstNOffset: guessedTimezone.nOffset,
      firstOffset: guessedTimezone.offset
    })
  }
}

const options = timezoneGroups.reduce((output, timezoneGroup) => {
  const timezoneGroupOptions = timezoneGroup.children
    .reduce((output, timezone) => {
      const value = timezone.name.split(' ').join('_')

      output.push({
        value,
        label: timezone.name,
        time: moment().tz(value).format('LT'),
        groupName: timezoneGroup.text
      })

      return output
    }, [])

  output.push({
    label: timezoneGroup.text,
    options: timezoneGroupOptions
  })

  return output
}, [])

const filter = createFilter({
  ignoreAccents: false,
  stringify: option => {
    return ''
      .concat(option.label, ' ')
      .concat(option.value, ' ')
      .concat(option.data.groupName)
  }
})

const Option = ({ children, ...props }) => {
  const {
    onMouseMove,
    onMouseOver,
    ...rest
  } = props.innerProps

  const newProps = Object.assign(props, { innerProps: rest })

  return (
    <components.Option {...newProps}>
      {children}
      <div className={styles.optionTime}>
        {newProps.data.time}
      </div>
    </components.Option>
  )
}

Option.propTypes = {
  children: PropTypes.node,
  innerProps: PropTypes.shape({
    onMouseMove: PropTypes.func,
    onMouseOver: PropTypes.func
  })
}

const Group = ({ children, label }) => {
  return (
    <div className={styles.group}>
      <div className={styles.groupLabel}>
        {label}
      </div>
      <div className={styles.groupOptions}>
        {children}
      </div>
    </div>
  )
}

Group.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string
}

const Svg = p => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    focusable='false'
    role='presentation'
    {...p}
  />
)

const DropdownIndicator = () => (
  <div className={styles.dropdownIndicator}>
    <Svg>
      <path
        d='M16.436 15.085l3.94 4.01a1 1 0 0 1-1.425 1.402l-3.938-4.006a7.5 7.5 0 1 1 1.423-1.406zM10.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z'
        fill='currentColor'
        fillRule='evenodd'
      />
    </Svg>
  </div>
)

const Button = ({
  isSelected,
  onClick,
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(styles.btn, {
        [styles.btnIsSelected]: isSelected
      })}
    >
      <div className={styles.btnContent}>
        <div className={styles.btnLabel}>
          {children}
        </div>
        <div className={styles.btnIconAfter}>
          <Svg style={{ marginRight: -6 }}>
            <path
              d='M8.292 10.293a1.009 1.009 0 0 0 0 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955a1.01 1.01 0 0 0 0-1.419.987.987 0 0 0-1.406 0l-2.298 2.317-2.307-2.327a.99.99 0 0 0-1.406 0z'
              fill='currentColor'
              fillRule='evenodd'
            />
          </Svg>
        </div>
      </div>
    </button>
  )
}

Button.propTypes = {
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node
}

const Dropdown = ({
  children,
  isOpen,
  target,
  onClose
}) => (
  <div
    className={cx(styles.dropdown, {
      [styles.isOpen]: isOpen
    })}
  >
    {target}
    <div className={styles.menu}>
      {children}
    </div>
    <div
      className={styles.blanket}
      onClick={onClose}
    />
  </div>
)

Dropdown.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  target: PropTypes.node,
  onClose: PropTypes.func
}

const getOptionFromValue = (options, value) => {
  for (const timezoneGroup of options) {
    for (const timezone of timezoneGroup.options) {
      if (timezone.value === value) {
        return timezone
      }
    }
  }

  return null
}

const selectStyles = {
  control: provided => ({
    ...provided,
    margin: 8
  }),
  menu: () => ({
    boxShadow: 'inset 0 1px 0 rgba(0, 0, 0, 0.08)'
  })
}

const TimezoneSelect = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentOption = getOptionFromValue(options, value)
  const selectElement = useRef(null)

  const toggleOpen = () => {
    setIsOpen(!isOpen)

    setTimeout(() => {
      selectElement.current.select.focus()
    })
  }

  const handleChange = option => {
    setIsOpen(false)
    onChange(option.value)
  }

  const handleNoOptions = () => {
    return (
      <span>
        No timezones found.
      </span>
    )
  }

  return (
    <div className={styles.component}>
      <Dropdown
        isOpen={isOpen}
        onClose={toggleOpen}
        target={(
          <Button
            isSelected={isOpen}
            onClick={toggleOpen}
            primary
          >
            {currentOption ? currentOption.label : 'Select a timezone'}
          </Button>
        )}
      >
        <ReactSelect
          ref={selectElement}
          noOptionsMessage={handleNoOptions}
          backspaceRemovesValue={false}
          components={{
            DropdownIndicator,
            IndicatorSeparator: null,
            Option,
            Group
          }}
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          isClearable={false}
          menuIsOpen
          onChange={handleChange}
          options={options}
          placeholder='Search a timezone...'
          styles={selectStyles}
          tabSelectsValue={false}
          value={currentOption}
          classNamePrefix='react-select'
          filterOption={filter}
        />
      </Dropdown>
    </div>
  )
}

TimezoneSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default TimezoneSelect
