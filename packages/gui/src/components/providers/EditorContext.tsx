import { ThemeProvider as ThemeUIProvider } from 'theme-ui'
import { get, unset } from 'lodash-es'
import { createContext, ReactChild, useContext } from 'react'
import { KeyArg, Recipe, EditorData } from './types'
import { applyRecipe } from './util'
import { ThemeProvider } from './ThemeContext'
import { theme as uiTheme } from '../ui/theme'
import { Theme } from '../../types/theme'

export interface EditorContextValue<V> extends EditorData<V> {
  theme?: Theme
  setValue(value: Recipe<V>): void
  getField<T = any>(key: KeyArg): T
  setField<T>(key: KeyArg, value: Recipe<T>): void
  setFields<T>(fields: Record<string, Recipe<T>>): void
  removeField(key: KeyArg): void
}

export function useEditor() {
  const context = useContext(EditorContext)
  const { onChange: editComponentData, value } = context

  function getField<T = any>(field: KeyArg | undefined) {
    return field ? (get(value, field) as T) : value
  }

  function setField<T>(field: KeyArg, recipe: Recipe<T>) {
    editComponentData((draft) => {
      applyRecipe(draft.value, field, recipe)
    })
  }
  function setFields<T>(fields: Record<string, Recipe<T>>) {
    editComponentData((draft) => {
      Object.entries(fields).map(([key, recipe]: any) => {
        applyRecipe(draft.value, key, recipe)
      })
    })
  }
  const onChange = setField

  const removeField = (field: KeyArg) => {
    editComponentData((draft) => {
      unset(draft.value, field)
    })
  }

  return {
    ...context,
    getField,
    setField,
    setFields,
    onChange,
    removeField,
  }
}

interface EditorContextProviderValue<V> extends EditorData<V> {
  onChange(recipe: Recipe<EditorData<V>>): void
  theme?: Theme
}

const EditorContext = createContext<EditorContextProviderValue<any>>({
  value: {},
  onChange: () => {},
})

export function EditorProvider<V>({
  children,
  theme,
  ...values
}: EditorContextProviderValue<V> & { children: ReactChild }) {
  return (
    <ThemeProvider theme={theme}>
      <ThemeUIProvider theme={uiTheme}>
        <EditorContext.Provider value={values}>
          {children}
        </EditorContext.Provider>
      </ThemeUIProvider>
    </ThemeProvider>
  )
}