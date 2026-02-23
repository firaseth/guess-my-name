import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { trpc } from "@/lib/trpc";

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const matchMutation = trpc.match.find.useMutation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      // Read image file and convert to base64
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: "base64" as any,
      });

      // Call match API
      const result = await matchMutation.mutateAsync({
        photoBase64: base64,
        mimeType: "image/jpeg",
      });

      // Navigate to results screen with match data
      router.push({
        pathname: "/results",
        params: {
          matchId: result.matchId.toString(),
          matched: result.matched ? "true" : "false",
          matchedName: result.matchedName || "Unknown",
          similarityScore: (result.similarityScore ?? 0).toString(),
          confidenceLevel: result.confidenceLevel,
        },
      });
    } catch (error) {
      console.error("Failed to analyze photo:", error);
      alert("Failed to analyze photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Upload Photo</Text>
            <Text className="text-sm text-muted">Choose a photo to find a match</Text>
          </View>

          {/* Image Preview */}
          {selectedImage ? (
            <View className="gap-3">
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: 300, borderRadius: 12 }}
              />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="border border-border rounded-lg py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-8 border-2 border-dashed border-border items-center gap-4">
              <Text className="text-5xl">📷</Text>
              <Text className="text-sm text-muted text-center">
                Select a photo to analyze
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={takePhoto}
              className="bg-primary rounded-lg py-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">📸</Text>
              <Text className="text-white font-semibold">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              className="bg-secondary rounded-lg py-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">🖼️</Text>
              <Text className="text-white font-semibold">Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
          {selectedImage && (
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isLoading}
              className={`rounded-lg py-4 items-center ${
                isLoading ? "bg-border opacity-50" : "bg-success"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Analyze Photo</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="border border-border rounded-lg py-3 items-center"
          >
            <Text className="text-foreground font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
