import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { View as ThemedView, Text as ThemedText } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export type Country = {
  name: string;
  code: string;
  callingCode: string;
  flag: string;
};

export const GCC_COUNTRIES: Country[] = [
  {
    name: "Bahrain",
    code: "BH",
    callingCode: "+973",
    flag: "🇧🇭",
  },
  {
    name: "Kuwait",
    code: "KW",
    callingCode: "+965",
    flag: "🇰🇼",
  },
  {
    name: "Oman",
    code: "OM",
    callingCode: "+968",
    flag: "🇴🇲",
  },
  {
    name: "Qatar",
    code: "QA",
    callingCode: "+974",
    flag: "🇶🇦",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    callingCode: "+966",
    flag: "🇸🇦",
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    callingCode: "+971",
    flag: "🇦🇪",
  },
  {
    name: "United States of America",
    code: "US",
    callingCode: "+1",
    flag: "🇺🇸",
  },
];

interface CountryPickerSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

const CountryPickerSheet = ({
  sheetRef,
  selectedCountry,
  onSelectCountry,
}: CountryPickerSheetProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { height } = Dimensions.get("window");
  const snapPoints = [height * 0.5];

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    sheetRef.current?.close();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: palette.background }}
      handleIndicatorStyle={{ backgroundColor: palette.muted }}
      style={{
        borderRadius: 24,
        overflow: "hidden",
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      )}
    >
      <BottomSheetView style={{ flex: 1, paddingVertical: 20 }}>
        {/* Header */}
        <ThemedView
          style={[styles.header, { borderBottomColor: palette.muted + "40" }]}
        >
          <ThemedText style={[styles.title, { color: palette.primary }]}>
            Select Country
          </ThemedText>
          <TouchableOpacity onPress={() => sheetRef.current?.close()}>
            <Feather name="x" size={28} color={palette.secondary} />
          </TouchableOpacity>
        </ThemedView>

        {/* Country List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {GCC_COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              onPress={() => handleSelectCountry(country)}
              style={[
                styles.countryItem,
                {
                  backgroundColor:
                    selectedCountry.code === country.code
                      ? palette.accent + "10"
                      : "transparent",
                },
              ]}
            >
              {/* Flag */}
              <Text style={styles.flag}>{country.flag}</Text>

              {/* Country Name and Code */}
              <ThemedView style={styles.countryInfo}>
                <ThemedText
                  style={[styles.countryName, { color: palette.primary }]}
                >
                  {country.name}
                </ThemedText>
                <ThemedText
                  style={[styles.callingCode, { color: palette.muted }]}
                >
                  {country.callingCode}
                </ThemedText>
              </ThemedView>

              {/* Check Icon if Selected */}
              {selectedCountry.code === country.code && (
                <Feather name="check-circle" size={24} color={palette.accent} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  callingCode: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});

export default CountryPickerSheet;
