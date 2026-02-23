import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const profileQuery = trpc.user.profile.useQuery();
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccountMutation.mutateAsync();
              logout();
              router.push("/(tabs)");
            } catch (error) {
              console.error("Failed to delete account:", error);
              alert("Failed to delete account. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Profile</Text>
            <Text className="text-sm text-muted">Manage your account</Text>
          </View>

          {/* Profile Info */}
          {profileQuery.isLoading ? (
            <ActivityIndicator size="large" color="#0066CC" />
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border gap-4">
              <View className="gap-2">
                <Text className="text-sm text-muted">Name</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {user?.name || "Not provided"}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted">Email</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {user?.email || "Not provided"}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm text-muted">Account Created</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString() : "Unknown"}
                </Text>
              </View>
            </View>
          )}

          {/* Quick Links */}
          <View className="gap-2">
            <TouchableOpacity
              onPress={() => alert("My Registrations")}
              className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
            >
              <Text className="font-semibold text-foreground">My Registrations</Text>
              <Text className="text-lg">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => alert("Privacy Policy")}
              className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
            >
              <Text className="font-semibold text-foreground">Privacy Policy</Text>
              <Text className="text-lg">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => alert("Terms of Service")}
              className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between"
            >
              <Text className="font-semibold text-foreground">Terms of Service</Text>
              <Text className="text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View className="gap-3 pt-4 border-t border-border">
            <Text className="text-sm font-semibold text-error">Danger Zone</Text>

            <TouchableOpacity
              onPress={() => logout()}
              className="bg-error bg-opacity-10 rounded-lg py-4 items-center border border-error"
            >
              <Text className="text-error font-semibold">Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              className={`rounded-lg py-4 items-center border-2 border-error ${
                isDeleting ? "opacity-50" : ""
              }`}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-error font-semibold">Delete Account & All Data</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
