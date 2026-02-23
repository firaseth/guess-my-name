import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router, useLocalSearchParams } from "expo-router";

export default function ResultsScreen() {
  const params = useLocalSearchParams();

  const matched = params.matched === "true";
  const matchedName = (params.matchedName as string) || "Unknown";
  const similarityScore = parseFloat((params.similarityScore as string) || "0");
  const confidenceLevel = (params.confidenceLevel as string) || "low";

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-success";
      case "medium":
        return "bg-warning";
      default:
        return "bg-error";
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Result Status */}
          <View className="items-center gap-4">
            {matched ? (
              <>
                <Text className="text-6xl">✅</Text>
                <Text className="text-3xl font-bold text-foreground text-center">Match Found!</Text>
              </>
            ) : (
              <>
                <Text className="text-6xl">❓</Text>
                <Text className="text-3xl font-bold text-foreground text-center">No Match</Text>
              </>
            )}
          </View>

          {/* Result Details */}
          {matched && (
            <View className="bg-surface rounded-lg p-6 border border-border gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted">Matched Person</Text>
                <Text className="text-2xl font-bold text-foreground">{matchedName}</Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted">Similarity Score</Text>
                <View className="gap-2">
                  <Text className="text-xl font-semibold text-foreground">
                    {(similarityScore * 100).toFixed(1)}%
                  </Text>
                  <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full bg-primary"
                      style={{ width: `${similarityScore * 100}%` }}
                    />
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted">Confidence Level</Text>
                <View
                  className={`${getConfidenceColor(confidenceLevel)} rounded-lg px-4 py-2 items-center`}
                >
                  <Text className="text-white font-semibold capitalize">{confidenceLevel}</Text>
                </View>
              </View>
            </View>
          )}

          {!matched && (
            <View className="bg-surface rounded-lg p-6 border border-border gap-4">
              <Text className="text-base text-muted text-center leading-relaxed">
                We couldn't find a confident match for this photo. This could mean:
              </Text>
              <View className="gap-2">
                <Text className="text-sm text-muted">
                  • The person hasn't registered yet
                </Text>
                <Text className="text-sm text-muted">
                  • The photo quality is too low
                </Text>
                <Text className="text-sm text-muted">
                  • The face angle is too different
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              className="bg-primary rounded-lg py-4 items-center"
            >
              <Text className="text-white font-semibold">Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/upload")}
              className="border border-primary rounded-lg py-4 items-center"
            >
              <Text className="text-primary font-semibold">Try Another Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
