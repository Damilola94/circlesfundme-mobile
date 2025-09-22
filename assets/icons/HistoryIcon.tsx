import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HistoryIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill="#1E1E1E"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M22.333 6v2.42c0 1.58-1 2.58-2.58 2.58h-3.42V4.01c0-1.11.91-2.01 2.02-2.01 1.09.01 2.09.45 2.81 1.17.72.73 1.17 1.73 1.17 2.83Z"
    />
    <Path
      fill="#1E1E1E"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M2.333 7v14c0 .83.94 1.3 1.6.8l1.71-1.28c.4-.3.96-.26 1.32.1l1.66 1.67c.39.39 1.03.39 1.42 0l1.68-1.68c.35-.35.91-.39 1.3-.09l1.71 1.28c.66.49 1.6.02 1.6-.8V4c0-1.1.9-2 2-2h-12c-3 0-4 1.79-4 4v1Z"
    />
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.333 13.01h3M9.333 9.01h3"
    />
    <Path
      fill="#1E1E1E"
      fillRule="evenodd"
      d="M6.328 13h.01-.01Z"
      clipRule="evenodd"
    />
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.328 13h.01"
    />
    <Path
      fill="#1E1E1E"
      fillRule="evenodd"
      d="M6.328 9h.01-.01Z"
      clipRule="evenodd"
    />
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6.328 9h.01"
    />
  </Svg>
)
export default HistoryIcon
