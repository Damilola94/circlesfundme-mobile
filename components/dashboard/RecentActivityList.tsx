import ExportIcons from "@/assets/icons/ExportIcons";
import ImportIcons from "@/assets/icons/ImportIcons";
import EmptyState from "@/components/ui/Empty";
import Loader from "@/components/ui/Loader";
import handleFetch from "@/services/api/handleFetch";

import { resFont } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Activity = {
  id: string;
  title: string;
  type: number;
  data: string;
  createdAt?: string;
};

type GroupedActivity = {
  id: string;
  title: string;
  time: string;
  amount: string;
};

type Section = {
  title: string;
  data: GroupedActivity[];
};

export default function RecentActivityList() {
  const { data, isLoading } = useQuery<{ data: Activity[] }>({
    queryKey: ["my-recent-activities"],
    queryFn: () =>
      handleFetch({
        endpoint: "users/my-recent-activities",
        auth: true,
        pQuery: {
          PageSize: 20,
          Type: "None",
          PageNumber: 1,
        },
      }),
  });

  const activities = data?.data || [];

  const formatData = (items: Activity[]): Section[] => {
    const grouped: Record<string, GroupedActivity[]> = {};

    items.forEach((item) => {
      const isContribution = item.type === 1;
      const amount = parseFloat(item.data).toFixed(2);
      const prefix = isContribution ? "+" : "-";
      const label = isContribution ? "Contribution" : "Withdrawal";

      const dateMoment = item.createdAt ? moment(item.createdAt) : null;

      const dateKey = dateMoment?.isValid()
        ? dateMoment.calendar(null, {
          sameDay: "[TODAY]",
          lastDay: "[YESTERDAY]",
          lastWeek: "DD MMMM",
          sameElse: "DD MMMM",
        })
        : "N/A";

      const time = dateMoment?.isValid() ? dateMoment.format("h:mm A") : "N/A";

      if (!grouped[dateKey]) grouped[dateKey] = [];

      grouped[dateKey].push({
        id: item.id,
        title: item.title || label,
        time,
        amount: `${prefix} ₦${amount}`,
      });
    });

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  };

  const sections: Section[] = formatData(activities);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Recent Activity</Text>

        {isLoading ? (
          <View>
            <Loader
              message="Recent Activity Loading..." />
          </View>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No recent activity"
            subtitle=""
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            renderItem={({ item }) => {
              const isCredit = item.amount.includes("+");
              return (
                <View style={styles.item}>
                  <View style={styles.left}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isCredit ? "#e0f9f1" : "#fde9e9",
                        },
                      ]}
                    >
                      {isCredit ? <ImportIcons /> : <ExportIcons />}
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      { color: isCredit ? "#00C281" : "#D01D1D" },
                    ]}
                  >
                    {item.amount}
                  </Text>
                </View>
              );
            }}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 },
    }),
  },
  header: {
    fontSize: resFont(13),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
    fontFamily: "OutfitMedium",
  },
  sectionHeader: {
    fontSize: resFont(10),
    fontFamily: "OutfitMedium",
    color: "#6B6B6B",
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: resFont(11),
    color: "#1A1A1A",
    fontFamily: "OutfitMedium",
  },
  time: {
    fontSize: resFont(11),
    color: "#999",
    marginTop: 2,
    fontFamily: "OutfitRegular",
  },
  amount: {
    fontSize: resFont(12),
    fontWeight: "bold",
    fontFamily: "OutfitMedium",
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: resFont(14),
    fontFamily: "OutfitSemiBold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: resFont(11),
    fontFamily: "OutfitRegular",
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 18,
  },
});
