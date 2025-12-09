import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, colors } from '../../config/theme';

const EditPostScreen = ({ route, navigation }) => {
  const { post } = route.params;
  console.log("[EditPost] Received post object:", post);
  console.log("[EditPost] Post keys:", Object.keys(post));
  console.log("[EditPost] post.id:", post.id, "post.post_id:", post.post_id, "post.p_id:", post.p_id);
  
  const [postText, setPostText] = useState(post.description);
  const [imageUrl, setImageUrl] = useState(post.image_url || '');
  const AUTH = "dGVhbTc6RjY4NWNmMWFlIWJiNWM1ODg4NWRlMzBkYw==";

  const handleUpdate = async () => {
    try {
      // Resolve the correct post ID field
      const actualPostId = post.id || post.post_id || post.p_id;
      console.log("[EditPost] Resolved post ID for update:", actualPostId);
      
      if (!actualPostId) {
        console.error("[EditPost] ERROR: No post ID found!", post);
        Alert.alert('Error', 'No post ID found. Cannot update.');
        return;
      }
      
      const response = await fetch(
        "http://martha.jh.shawinigan.info/queries/update-post/execute",
        {
          method: "POST",
          headers: {
            "auth": AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            'post_id': String(actualPostId),
            'description': postText,
            'image_url': imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Post updated successfully.");
        navigation.navigate('Home', { postUpdated: true });
      } else {
        Alert.alert("Error", "Could not update the post.");
        console.log("Erreur dans la requete:", data.error);
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred while saving.");
      console.log("Erreur fetch:", err);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post? This action cannot be undone.",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        // Resolve the correct post ID field
                        const actualPostId = post.id || post.post_id || post.p_id;
                        console.log("[EditPost] Resolved post ID for delete:", actualPostId);
                        
                        if (!actualPostId) {
                          console.error("[EditPost] ERROR: No post ID found!", post);
                          Alert.alert('Error', 'No post ID found. Cannot delete.');
                          return;
                        }
                        
                        const response = await fetch(
                          "http://martha.jh.shawinigan.info/queries/delete-post/execute",
                          {
                            method: "POST",
                            headers: {
                              "auth": AUTH,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ 'post_id': String(actualPostId) }),
                          }
                        );
                  
                        const data = await response.json();
                  
                        if (data.success) {
                          Alert.alert("Success", "Post deleted successfully.");
                          navigation.navigate('Home', { postUpdated: true });
                        } else {
                          Alert.alert("Error", "Could not delete the post.");
                          console.log("Erreur dans la requete:", data.error);
                        }
                      } catch (err) {
                        Alert.alert("Error", "An error occurred while deleting.");
                        console.log("Erreur fetch:", err);
                      }
                },
                style: "destructive",
            },
        ]
    );
  };

  return (
    <SafeAreaView style={theme.screenContainer}>
        <Text style={[theme.title, {marginVertical: 20}]}>Edit Post</Text>

        <Text style={theme.label}>Description</Text>
        <TextInput
            style={[theme.input, {height: 100, textAlignVertical: 'top'}]}
            value={postText}
            onChangeText={setPostText}
            multiline
            placeholderTextColor="#aaa"
        />

        <Text style={theme.label}>Image URL</Text>
        <TextInput
            style={theme.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.png"
            placeholderTextColor="#aaa"
        />
        
        {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={theme.previewImage} />
        ) : null}

        <TouchableOpacity style={theme.publishButton} onPress={handleUpdate}>
            <Text style={theme.publishButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[theme.publishButton, {backgroundColor: colors.danger}]} onPress={handleDelete}>
            <Text style={theme.publishButtonText}>Delete Post</Text>
        </TouchableOpacity>

    </SafeAreaView>
  );
};

export default EditPostScreen;
