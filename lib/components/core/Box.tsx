import React, { ReactNode } from 'react'
import { Box as InkBox } from 'ink'
import { colors } from '../../design/colors.js'

interface BoxProps {
  children?: ReactNode
  flexDirection?: 'row' | 'column'
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic'
  borderColor?: string
  borderDimColor?: boolean
  padding?: number
  margin?: number
  width?: number | string
  height?: number | string
  isFocused?: boolean
  position?: 'relative' | 'absolute'
  marginTop?: number | string
  marginLeft?: number | string
}

export const Box: React.FC<BoxProps> = ({
  children,
  isFocused = false,
  borderColor,
  ...props
}) => {
  const finalBorderColor = isFocused 
    ? colors.borderFocus
    : borderColor || colors.border

  return (
    <InkBox
      {...props}
      borderColor={finalBorderColor}
    >
      {children}
    </InkBox>
  )
}

export default Box