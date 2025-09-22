import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ImportIcons = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      stroke="#00A86B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"
    />
    <Path
      stroke="#00A86B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m22 2-8.2 8.2M13 6.17V11h4.83"
    />
  </Svg>
)
export default ImportIcons
