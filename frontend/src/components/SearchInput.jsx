import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, Calendar, Tag, Building2, Layers } from 'lucide-react'
import { getSearchSuggestions, normalizeText } from '../utils/search.js'
import './SearchInput.css'

export default function SearchInput({
  value = '',
  onChange,
  onSearch,
  onClear,
  events = [],
  placeholder = 'Search events, topics, skills...',
  className = '',
  id = 'search-input'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const normalizedVal = normalizeText(value)

  // Compute suggestions dynamically
  const suggestions = useMemo(() => {
    if (!normalizedVal) return []
    return getSearchSuggestions(events, normalizedVal, 6)
  }, [events, normalizedVal])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Reset highlight index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.text)
    setIsOpen(false)
    setHighlightedIndex(-1)
    if (onSearch) {
      onSearch(suggestion.text, suggestion)
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    if (onClear) {
      onClear()
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        if (onSearch) onSearch(value)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex])
      } else {
        setIsOpen(false)
        if (onSearch) onSearch(value)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Category':
        return <Layers size={13} />
      case 'Organizer':
        return <Building2 size={13} />
      case 'Tag':
        return <Tag size={13} />
      case 'Event':
      default:
        return <Calendar size={13} />
    }
  }

  return (
    <div className={`search-input-wrapper ${className}`} ref={containerRef}>
      <div className="search-input-box">
        <Search size={16} className="search-input-icon" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (value.trim() && suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            className="search-input-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="search-suggestions-dropdown" role="listbox" id={`${id}-suggestions`}>
          <div className="search-suggestions-header">
            <span>Suggestions</span>
            <small>Press ↑↓ to navigate, ↵ to select</small>
          </div>
          <ul className="search-suggestions-list">
            {suggestions.map((item, index) => {
              const isSelected = index === highlightedIndex
              return (
                <li
                  key={`${item.type}-${item.text}`}
                  id={`${id}-suggestion-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`search-suggestion-item ${isSelected ? 'is-active' : ''}`}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="search-suggestion-type-icon">{getTypeIcon(item.type)}</span>
                  <span className="search-suggestion-text">{item.text}</span>
                  <span className={`pill search-suggestion-pill search-suggestion-pill--${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
