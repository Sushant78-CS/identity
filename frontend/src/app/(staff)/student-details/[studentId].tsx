import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function StudentDetailsScreen() {
  const { studentId } = useLocalSearchParams<{
    studentId: string;
  }>();

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Student Details</Text>
      <Text>{studentId}</Text>
    </View>
  );
}
