import NotificationCard from "@/components/notifications-card/NotificationCard";
import Loader from "@/components/ui/Loader";
import handleFetch from "@/services/api/handleFetch";
import { resFont, resHeight } from "@/utils/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets  } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const PAGE_SIZE = 10;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      initialPageParam: 1,
      queryFn: ({ pageParam = 1 }) =>
        handleFetch({
          endpoint: "notifications",
          auth: true,
          pQuery: {
            PageSize: PAGE_SIZE,
            PageNumber: pageParam,
          },
        }),
      getNextPageParam: (lastPage, pages) => {
        return lastPage?.data?.length === PAGE_SIZE
          ? pages.length + 1
          : undefined;
      },
    });

    const notificationsData = data?.pages
    ? data.pages
        .flatMap((page) => page?.data || [])
        .reduce((acc, item) => {
          const adjustedDate = moment(item.createdDate).add(1, "hours"); 
          const dateKey = adjustedDate.format("DD MMMM").toUpperCase();
          const formatted = {
            id: item.id,
            title: item.title,
            time: adjustedDate.format("h:mm A"),
            amount:
              item.type === "Contribution"
                ? `+₦${item.data}`
                : item.type === "Withdrawal"
                ? `-₦${item.data}`
                : null,
          };
          const section = acc.find(
            (s: { title: string }) => s.title === dateKey
          );
          if (section) {
            section.data.push(formatted);
          } else {
            acc.push({ title: dateKey, data: [formatted] });
          }
          return acc;
        }, [])
    : [];
  

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {!data && <Loader message="Notification Loading..."/>}
      <View style={{ flex: 1, paddingTop: insets.top || 40 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Notifications</Text>
          <SectionList
            sections={notificationsData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            renderSectionHeader={({ section }) => (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                <View style={styles.sectionBox}>
                  {section.data.map((item) => (
                    <NotificationCard
                      key={item.id}
                      title={item.title}
                      time={item.time}
                      amount={item.amount}
                    />
                  ))}
                </View>
              </View>
            )}
            renderItem={() => null}
          />
          {isFetchingNextPage && (
            <View style={{ paddingVertical: 10 }}>
              <Text style={{ textAlign: "center" }}>Loading more...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: resFont(22),
    fontFamily: "OutfitBold",
    marginBottom: resHeight(2),
  },
  sectionHeader: {
    fontSize: 12,
    color: "#6B6B6B",
    marginBottom: 8,
    fontFamily: "OutfitMeduim",
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
