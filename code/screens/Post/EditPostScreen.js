import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, Text, Image, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, colors } from '../../config/theme';
import { marthaFetch, getPostId, getCommunityId, getHabitId, sanitizeForSQL, urlToBase64, isBase64Image } from '../../config/api';
import Dropdown from '../../components/Dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';


const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  
  const postId = getPostId(post);
  
  const [postText, setPostText] = useState(post.description);
  // store the actual base64 for saving, but show empty field if it's base64
  const [originalBase64, setOriginalBase64] = useState(isBase64Image(post.image_url) ? post.image_url : null);
  const [imageUrl, setImageUrl] = useState(isBase64Image(post.image_url) ? '' : (post.image_url || ''));
  const [hasExistingImage, setHasExistingImage] = useState(!!post.image_url);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const jsonCommunities = await marthaFetch("select-communities");
        if (jsonCommunities.success) {
          setCommunities(jsonCommunities.data);
          
          // Find and set the community ID by matching the community name
          if (post.community) {
            const matchedCommunity = jsonCommunities.data.find(c => c.name === post.community);
            if (matchedCommunity) {
              setSelectedCommunity(getCommunityId(matchedCommunity));
            }
          }
        }

        const uid = await AsyncStorage.getItem("user_id");
        if (uid) {
          const jsonHabits = await marthaFetch("select-user-habits", { user_id: uid });
          if (jsonHabits.success) {
            setHabits(jsonHabits.data);
            
            // Set the habit ID directly from post data
            if (post.habit_id) {
              setSelectedHabit(post.habit_id);
            }
          }
        }
      } catch (error) {}
    }
    loadData();
  }, []);

  const handleUpdate = async () => {
    if (!postId) {
      Alert.alert('Error', 'No post ID found. Cannot update.');
      return;
    }

    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community.');
      return;
    }

    try {
      setIsConverting(true);
      let imageData = '';
      
      if (imageUrl && imageUrl.trim() !== '') {
        // user entered a new URL, convert it to base64
        imageData = await urlToBase64(imageUrl);
      } else if (originalBase64) {
        // no new URL but we have existing image, keep it
        imageData = originalBase64;
      }
      setIsConverting(false);
      
      const data = await marthaFetch("update-post", {
        'post_id': postId,
        'description': sanitizeForSQL(postText),
        'image_url': sanitizeForSQL(imageData),
        'community_id': selectedCommunity,
        'habit_id': selectedHabit || null,
      });

      if (data.success) {
        Alert.alert("Success", "Post updated successfully.");
        navigation.navigate('Home', { postUpdated: true });
      } else {
        Alert.alert("Error", data.error || "Could not update the post.");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred while saving.");
    }
  };

  const performDelete = async () => {
    try {
      const data = await marthaFetch("delete-post", { 'post_id': postId });

      if (data.success) {
        if (Platform.OS === 'web') {
          alert("Post deleted successfully.");
        } else {
          Alert.alert("Success", "Post deleted successfully.");
        }
        navigation.navigate('Home', { postUpdated: true });
      } else {
        if (Platform.OS === 'web') {
          alert(data.error || "Could not delete the post.");
        } else {
          Alert.alert("Error", data.error || "Could not delete the post.");
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        alert("An error occurred while deleting.");
      } else {
        Alert.alert("Error", "An error occurred while deleting.");
      }
    }
  };

  const handleDelete = async () => {
    if (!postId) {
      if (Platform.OS === 'web') {
        alert('No post ID found. Cannot delete.');
      } else {
        Alert.alert('Error', 'No post ID found. Cannot delete.');
      }
      return;
    }
    
    // Use window.confirm on web, Alert.alert on mobile
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
      if (confirmed) {
        await performDelete();
      }
    } else {
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={theme.screenContainer}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
        <View style={[theme.headerRow, {justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10}]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={theme.title}>Edit Post</Text>
            <View style={{width: 24}} />
        </View>

        <ScrollView style={{paddingHorizontal: 20}} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <Text style={theme.label}>Community</Text>
        <Dropdown
            options={communities.map(c => ({
                label: c.name,
                value: getCommunityId(c)
            }))}
            selectedValue={selectedCommunity}
            onSelect={setSelectedCommunity}
            placeholder="Select a community"
        />

        <Text style={theme.label}>Link a Habit (Optional)</Text>
        <Dropdown
            options={[
                { label: "-- None --", value: null },
                ...habits.map(h => ({
                    label: h.name,
                    value: getHabitId(h)
                }))
            ]}
            selectedValue={selectedHabit}
            onSelect={setSelectedHabit}
            placeholder="Select a habit"
        />

        <Text style={theme.label}>Description</Text>
        <TextInput
            style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
            value={postText}
            onChangeText={setPostText}
            multiline
            placeholderTextColor="#aaa"
        />

        <Text style={theme.label}>Image URL {hasExistingImage && !imageUrl ? "(current image will be kept)" : ""}</Text>
        <TextInput
            style={theme.input}
            value={imageUrl}
            onChangeText={(text) => {
                setImageUrl(text);
                if (text) setHasExistingImage(false);
            }}
            placeholder={hasExistingImage ? "Leave empty to keep current image, or enter new URL" : "https://example.com/image.png"}
            placeholderTextColor="#aaa"
        />
        
        {/* Show preview: either new URL or existing base64 image */}
        {(imageUrl || originalBase64) ? (
            <Image 
                source={{ uri: imageUrl || originalBase64 }} 
                style={theme.previewImage} 
            />
        ) : null}

        <TouchableOpacity 
            style={[theme.publishButton, isConverting && {opacity: 0.6}]} 
            onPress={handleUpdate}
            disabled={isConverting}
        >
            <Text style={theme.publishButtonText}>
                {isConverting ? "Processing image..." : "Save Changes"}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[theme.publishButton, {backgroundColor: colors.danger, marginBottom: 40}]} onPress={handleDelete}>
            <Text style={theme.publishButtonText}>Delete Post</Text>
        </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditPostScreen;
