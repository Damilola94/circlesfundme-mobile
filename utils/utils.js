import { Dimensions, Platform, StatusBar } from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";

export const { width, height } = Dimensions.get("window");

const deviceHeight = isIphoneX()
  ? height - 78
  : Platform.OS === "android"
  ? height - StatusBar.currentHeight
  : height;

const responsiveHeight = (h) => {
  return height * (h / 100);
};

const responsiveWidth = (w) => {
  return width * (w / 100);
};

const RFValue = (fontSize) => {
  const standardScreenHeight = 680;
  const heightPercent = (fontSize * deviceHeight) / standardScreenHeight;
  return Math.round(heightPercent);
};

    
export const formatAmountWithDecimal = (
  amount,
  currency
) => {
  console.log(typeof amount, amount,"amount");
  
  if (typeof amount !== "number") return `${currency}0.00`;

  const isNegative = amount < 0;
  const dividedAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2, 
  }).format(dividedAmount);

  return isNegative ? `(${currency}${formatted})` : `${currency}${formatted}`;
};

export const formatAmount = (value) => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return "";

  return `₦${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatAmountWithThresholds = (value) => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return "";

  const formatShort = (n, unit) => {
    const short = n.toFixed(1);
    return short.endsWith('.0') ? short.slice(0, -2) + unit : short + unit;
  };

  if (num >= 1_000_000_000) {
    return `₦${formatShort(num / 1_000_000_000, "b")}`;
  } else if (num >= 1_000_000) {
    return `₦${formatShort(num / 1_000_000, "m")}`;
  } else if (num >= 1_000) {
    return `₦${formatShort(num / 1_000, "k")}`;
  }

  return `₦${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (value) => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString();
};

export const formattedAmount = (value) => {
  const cleanedValue = value.replace(/[^\d.]/g, "");

  const numberValue = parseFloat(cleanedValue);

  if (isNaN(numberValue)) return "₦0.00";

  return `₦${numberValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const roundNegativeTowardsZero = (num) => {
  return num < 0 ? 0 : num;
};

export const toTitleCase = (str) => {
  return str?.replace(/\w\S*/g, function (txt) {
    return txt?.charAt(0)?.toUpperCase() + txt?.substr(1)?.toLowerCase();
  });
};

export const resFont = (val) => RFValue(val);
export const resHeight = (val) => responsiveHeight(val);

export const resWidth = (val) => responsiveWidth(val);

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export const toNumber = (val) => {
  if (val === null || val === undefined) return 0;

  const str = typeof val === "number" ? val.toString() : val;
  return parseFloat(str.replace(/,/g, "")) || 0;
};

export const formatMoney = (value) => {
  const numericValue = value?.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return Number(numericValue)?.toLocaleString("en-NG");
};
