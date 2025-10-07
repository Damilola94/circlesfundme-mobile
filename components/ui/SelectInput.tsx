"use client"

import { Colors } from "@/constants/Colors"
import { resFont, resHeight, resWidth } from "@/utils/utils"
import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useMemo, useState } from "react"
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewStyle } from "react-native"

interface SelectInputProps {
  label: string
  value: string
  placeholder?: string
  onSelect: (value: string) => void
  options: string[]
  style?: ViewStyle
  hasSearch?: boolean
  editable?: boolean
  fixedHeight?: boolean
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  placeholder,
  onSelect,
  options,
  hasSearch,
  style,
  editable,
  fixedHeight,
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSelect = (item: string) => {
    onSelect(item)
    setSearchQuery("")
    setModalVisible(false)
  }

  const filteredOptions = useMemo(() => {
    return options.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery, options])

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectBox, editable === false && { backgroundColor: "#F5F5F5" }]}
        onPress={() => {
          if (editable !== false) {
            setModalVisible(true)
          }
        }}
        activeOpacity={editable === false ? 1 : 0.7}
      >
        <Text style={[styles.selectText, !value && { color: "#999" }]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              fixedHeight ? { height: "60%" } : filteredOptions.length <= 5 && { minHeight: "20%" },
            ]}
          >
            {hasSearch && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                placeholderTextColor="#999"
              />
            )}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.noResultText}>No results found</Text>}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={fixedHeight ? { paddingTop: 0 } : { flexGrow: 1 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: resHeight(1.5),
  },
  label: {
    marginBottom: resHeight(1),
    fontWeight: "500",
    fontSize: resFont(12),
    color: Colors.dark.background,
    fontFamily: "OutfitRegular",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: resWidth(10),
    padding: resHeight(2),
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: resFont(12),
    color: Colors.dark.background,
    fontFamily: "OutfitLight",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    minHeight: "40%",
    maxHeight: "70%",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: resFont(13),
    fontFamily: "OutfitLight",
    color: Colors.dark.background,
  },
  option: {
    paddingVertical: 15,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: resFont(14),
    fontFamily: "OutfitLight",
    color: Colors.dark.background,
  },
  noResultText: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: resFont(12),
    color: "#999",
    fontFamily: "OutfitRegular",
  },
})

export default SelectInput
