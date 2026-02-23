import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const { user, isAuthenticated, loading } = useAuth();
  const [hasConsent, setHasConsent] = useState(false);
  const [checkingConsent, setCheckingConsent] = useState(true);

  const consentQuery = trpc.consent.check.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const recentMatchesQuery = trpc.match.history.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (consentQuery.data) {
      setHasConsent(consentQuery.data.hasConsented);
      setCheckingConsent(false);
    }
  }, [consentQuery.data]);

  if (loading || checkingConsent) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0066CC" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center gap-6 px-6">
        <View className="items-center gap-3">
          <Text className="text-4xl font-bold text-foreground">Guess My Name</Text>
          <Text className="text-base text-muted text-center">
            Identify people by their photos
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("../oauth/callback")}
          className="w-full bg-primary rounded-lg py-4 items-center"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (!hasConsent) {
    return (
      <ScreenContainer className="items-center justify-center gap-6 px-6">
        <View className="items-center gap-3">
          <Text className="text-2xl font-bold text-foreground">Privacy & Consent</Text>
          <Text className="text-sm text-muted text-center leading-relaxed">
            This app uses face recognition to identify registered users. Your photos will be
            securely stored and encrypted. You can delete your data anytime.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("../consent")}
          className="w-full bg-primary rounded-lg py-4 items-center"
        >
          <Text className="text-white font-semibold">Review & Accept</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Welcome Section */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Welcome, {user?.name || "User"}
            </Text>
            <Text className="text-sm text-muted">Ready to find someone?</Text>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            onPress={() => router.push("../upload")}
            className="bg-primary rounded-2xl p-8 items-center gap-3 active:opacity-80"
          >
            <Text className="text-5xl">📸</Text>
            <Text className="text-lg font-semibold text-white">Upload Photo</Text>
            <Text className="text-xs text-white opacity-80">Find a match</Text>
          </TouchableOpacity>

          {/* Recent Matches */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Recent Matches</Text>
            {recentMatchesQuery.isLoading ? (
              <ActivityIndicator size="small" color="#0066CC" />
            ) : recentMatchesQuery.data && recentMatchesQuery.data.length > 0 ? (
              <View className="gap-2">
                {recentMatchesQuery.data.map((match) => (
                  <View
                    key={match.id}
                    className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{match.matchedName}</Text>
                      <Text className="text-xs text-muted">
                        {(match.similarityScore * 100).toFixed(0)}% match
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        match.confidenceLevel === "high"
                          ? "bg-success"
                          : match.confidenceLevel === "medium"
                            ? "bg-warning"
                            : "bg-error"
                      }`}
                    >
                      <Text className="text-xs font-semibold text-white capitalize">
                        {match.confidenceLevel}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted text-center py-4">
                No matches yet. Upload a photo to get started!
              </Text>
            )}
          </View>

          {/* Quick Stats */}
          <View className="bg-surface rounded-lg p-4 gap-2 border border-border">
            <Text className="text-sm font-semibold text-foreground">Account Status</Text>
            <Text className="text-xs text-muted">
              Email: {user?.email || "Not provided"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
