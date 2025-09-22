/* eslint-disable react/display-name */
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";

import HomeIcon from "@/assets/icons/HomeIcon";
import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";
import { resFont, resHeight } from "@/utils/utils";

import HistoryIcon from "@/assets/icons/HistoryIcon";
import HistoryIconOutline from "@/assets/icons/HistoryIconOutline";
import HomeIconOutline from "@/assets/icons/HomeIconOutline";
import NotificationIcon from "@/assets/icons/NotificationIcon";
import NotificationIconOutline from "@/assets/icons/NotificationIconOutline";
import ProfileIcon from "@/assets/icons/ProfileIcon";
import ProfileIconOutline from "@/assets/icons/ProfileIconOutline";
import ProtectedRoute from "../protected-route";

export default function TabLayout() {
  const renderLabel =
    (label: string) =>
      ({ focused }: { color: string; focused: boolean }) =>
      (
        <Text
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            color: Colors.dark.background,
            padding: resHeight(1),
            borderRadius: resHeight(3),
            fontSize: resFont(10),
            fontFamily: "OutfitSemiBold",
            opacity: focused ? 1 : 0.4,
          }}
        >
          {label}
        </Text>
      );

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.dark.background,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarLabel: renderLabel("Dashboard"),
            tabBarIcon: ({ focused }) =>
              focused ? (
                <HomeIcon
                  fill={focused ? Colors.dark.background : "#A9A9A9"}
                  stroke="#fff"
                />
              ) : (
                <HomeIconOutline />
              ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarLabel: renderLabel("History"),
            tabBarIcon: ({ focused }) =>
              focused ? (
                <HistoryIcon fill={Colors.dark.background} stroke="#fff" />
              ) : (
                <HistoryIconOutline />
              ),
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            title: "Loan",
            tabBarLabel: renderLabel("Notifications"),
            tabBarIcon: ({ focused }) =>
              focused ? (
                <NotificationIcon stroke={Colors.dark.background} />
              ) : (
                <NotificationIconOutline />
              ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: renderLabel("Profile"),
            tabBarIcon: ({ focused }) =>
              focused ? (
                <ProfileIcon stroke={Colors.dark.background} />
              ) : (
                <ProfileIconOutline />
              ),
          }}
        />
      </Tabs>
    </ProtectedRoute>

  );
}
