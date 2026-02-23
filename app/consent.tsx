import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ConsentScreen() {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordConsentMutation = trpc.consent.record.useMutation();

  const handleAccept = async () => {
    if (!agreed) return;

    setIsSubmitting(true);
    try {
      await recordConsentMutation.mutateAsync({
        consentGiven: true,
        userAgent: "mobile-app",
      });
      router.push("/(tabs)");
    } catch (error) {
      console.error("Failed to record consent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Privacy & Consent</Text>
            <Text className="text-sm text-muted">Please read carefully</Text>
          </View>

          {/* Content */}
          <View className="gap-4 bg-surface rounded-lg p-4 border border-border">
            <View className="gap-2">
              <Text className="font-semibold text-foreground">📸 Photo Storage</Text>
              <Text className="text-sm text-muted leading-relaxed">
                Your photos will be securely stored and encrypted. Only you can access your
                registered photos.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-foreground">🔍 Face Recognition</Text>
              <Text className="text-sm text-muted leading-relaxed">
                We use AI to analyze faces in your photos. This data is only used to match
                against other registered users who have consented.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-foreground">🛡️ Data Protection</Text>
              <Text className="text-sm text-muted leading-relaxed">
                Your data is protected under GDPR standards. You can request deletion of all
                your data at any time.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-foreground">⚖️ Ethical Use</Text>
              <Text className="text-sm text-muted leading-relaxed">
                This app is designed to identify people who have voluntarily registered. It
                must not be used for surveillance or identifying individuals without consent.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="font-semibold text-foreground">🗑️ Data Deletion</Text>
              <Text className="text-sm text-muted leading-relaxed">
                You can delete your account and all associated data from your profile settings
                at any time.
              </Text>
            </View>
          </View>

          {/* Consent Checkbox */}
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            className={`flex-row items-center gap-3 p-4 rounded-lg border-2 ${
              agreed ? "border-primary bg-primary bg-opacity-10" : "border-border bg-surface"
            }`}
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center ${
                agreed ? "bg-primary border-primary" : "border-border"
              }`}
            >
              {agreed && <Text className="text-white font-bold">✓</Text>}
            </View>
            <Text className="flex-1 text-sm font-medium text-foreground">
              I understand and accept the privacy policy
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleAccept}
              disabled={!agreed || isSubmitting}
              className={`rounded-lg py-4 items-center ${
                agreed && !isSubmitting ? "bg-primary" : "bg-border opacity-50"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Accept & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-lg py-4 items-center border border-border"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
