import type React from "react"

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

export const Chart = ({ data, children }: ChartProps) => {
  return <>{children}</>
}

interface ChartContainerProps {
  children: React.ReactNode
}

export const ChartContainer = ({ children }: ChartContainerProps) => {
  return <>{children}</>
}

interface ChartTooltipProps {
  content: React.ReactNode
}

export const ChartTooltip = ({ content }: ChartTooltipProps) => {
  return <>{content}</>
}

interface ChartTooltipContentProps {
  [key: string]: any
}

export const ChartTooltipContent = ({ ...props }: ChartTooltipContentProps) => {
  return <div>Tooltip Content</div>
}

interface ChartLegendProps {
  children: React.ReactNode
}

export const ChartLegend = ({ children }: ChartLegendProps) => {
  return <>{children}</>
}

interface ChartLegendItemProps {
  name: string
  color: string
}

export const ChartLegendItem = ({ name, color }: ChartLegendItemProps) => {
  return <div>{name}</div>
}

interface ChartBarProps {
  dataKey: string
  fill: string
  radius: number[]
}

export const ChartBar = ({ dataKey, fill, radius }: ChartBarProps) => {
  return null
}

interface ChartLineProps {
  dataKey: string
  stroke: string
  strokeWidth: number
  activeDot: { r: number }
}

export const ChartLine = ({ dataKey, stroke, strokeWidth, activeDot }: ChartLineProps) => {
  return null
}

interface ChartAreaProps {
  dataKey: string
  fill: string
  fillOpacity: number
}

export const ChartArea = ({ dataKey, fill, fillOpacity }: ChartAreaProps) => {
  return null
}

export const ChartGrid = () => {
  return null
}

interface ChartXAxisProps {
  dataKey: string
}

export const ChartXAxis = ({ dataKey }: ChartXAxisProps) => {
  return null
}

export const ChartYAxis = () => {
  return null
}
