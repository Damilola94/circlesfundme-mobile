// screens/loan/LoanScreen.tsx
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

import LoanHistoryCard from "@/components/history/LoanHistoryCard";
import EmptyState from "@/components/ui/Empty";
import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight, resWidth } from "@/utils/utils";
import moment from "moment";

export default function LoanScreen() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "all", title: "All Loans" },
    { key: "active", title: "Active Loans" },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["loanApplications"],
    queryFn: () =>
      handleFetch({
        endpoint: "loanapplications",
        auth: true,
      }),
  });

  const { data: activeLoan, isLoading: isActiveLoading } = useQuery({
    queryKey: ["users-my-loan-history"],
    queryFn: () =>
      handleFetch({
        endpoint: "users",
        extra: "my-loan-history",
        auth: true,
      }),
  });
  const allLoans = data?.data || [];
  const activeLoans = activeLoan?.data || [];

  const renderLoans = (loans: any[], title: string) => {
    if (isLoading || isActiveLoading) return <Loader message={`${title} Loading...`} />;

    if (!isLoading && loans.length === 0) {
      return (
        <EmptyState
          title="No Loans Found"
          subtitle="You don’t have any loans in this category."
        />
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginTop: 10 }}
      >
        {loans.map((item: any, index: number) => (
          <LoanHistoryCard
            key={item.id || `loan-${index}`}
            amount={item.requestedAmount}
            amountRepaid={item.amountRepaid}
            dateRange={
              item.firstRepaymentDate && item.lastRepaymentDate
                ? `${moment(item.firstRepaymentDate).format("DD/MM/YYYY")} - ${moment(item.lastRepaymentDate).format("DD/MM/YYYY")}`
                : ""
            }
            dateApplied={item.dateApplied ? moment(item.dateApplied).format("DD/MM/YYYY") : ""}
            status={item.status}
            progress={item.percentageRepaid}
            repaymentCount={item.repaymentCount}
            totalRepaymentCount={item.totalRepaymentCount}
          />
        ))}
      </ScrollView>
    );
  };

  const renderScene = SceneMap({
    all: () => renderLoans(allLoans, "All Loans"),
    active: () => renderLoans(activeLoans, "Active Loans"),
  });

  return (
    <View style={{ flex: 1, paddingTop: insets.top || 40 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Loans</Text>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: resWidth(100) }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: Colors.dark.primary, height: 3, width: "30%", alignItems: "flex-start", marginLeft: resWidth(10) }}
              style={{
                backgroundColor: Colors.dark.background,
                borderRadius: 16,
              }}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: resFont(22),
    fontFamily: "OutfitBold",
    marginBottom: resHeight(2),
  },
});
