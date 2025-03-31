import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Text, 
  Alert, 
  TextInput, 
  Keyboard, 
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Dimensions, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Video } from 'expo-av';

export default function PersonalFeedScreen() {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [videoDimensions, setVideoDimensions] = useState({ width: 400, height: 400 });
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  // Request permission to access media library on mount
  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  const requestPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please allow access to your photo library to select media.");
      }
    } catch (error) {
      console.error("Permission request error:", error);
      setErrorMsg("Error requesting media permissions.");
    }
  };

  const handleSelectImagePress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "You need to enable access to your photos in Settings.");
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        if (selectedAsset.type === 'image') {
          setMedia({ uri: selectedAsset.uri, type: 'image' });
        } else if (selectedAsset.type === 'video') {
          setMedia({ uri: selectedAsset.uri, type: 'video' });
        }
        setErrorMsg(null);
      }
    } catch (error) {
      console.error("Error opening image picker:", error);
      Alert.alert("Error", "There was an error selecting the media.");
      setErrorMsg("Media selection failed. Please try again.");
    }
  };

  const handleUploadMedia = async () => {
    if (!media) return;
    setIsUploading(true);
    try {
      console.log("Uploading media with caption:", caption);
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert("Success", "Your media was uploaded successfully!");
      setMedia(null);
      setCaption('');
      setErrorMsg(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "There was an error uploading your media.");
      setErrorMsg("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          {/* If no media is selected, display the enhanced pet-themed placeholder */}
          {!media && (
            <View style={styles.placeholderCard}>
              <Image 
                source={require('../assets/pet_welcome.png')}
                style={styles.placeholderImage}
                resizeMode="contain"
              />
              <Text style={styles.placeholderTitle}>Create a Post</Text>
              <Text style={styles.placeholderText}>
                Share your pet’s cutest moments and heartwarming adventures!
              </Text>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.selectMediaButton} 
                onPress={handleSelectImagePress}
              >
                <Text style={styles.buttonText}>Select Media</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Once media is selected, display the media preview and caption input */}
          {media && (
            <>
              {media.type === 'image' && (
                <Image source={{ uri: media.uri }} style={styles.media} />
              )}
              {media.type === 'video' && (
                <Video
                  source={{ uri: media.uri }}
                  style={{
                    width: videoDimensions.width,
                    height: videoDimensions.height,
                    aspectRatio: videoDimensions.width / videoDimensions.height,
                    borderRadius: 15,
                    marginBottom: 20,
                  }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                  onReadyForDisplay={({ naturalSize }) => {
                    if (naturalSize?.width && naturalSize?.height) {
                      const maxWidth = screenWidth * 0.95;
                      const maxHeight = 400;
                      const widthRatio = maxWidth / naturalSize.width;
                      const heightRatio = maxHeight / naturalSize.height;
                      const scaleFactor = Math.min(widthRatio, heightRatio);
                      const adjustedWidth = naturalSize.width * scaleFactor;
                      const adjustedHeight = naturalSize.height * scaleFactor;
                      setVideoDimensions({ width: adjustedWidth, height: adjustedHeight });
                    }
                  }}
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    Alert.alert("Video Error", "There was an error displaying the video.");
                  }}
                />
              )}
              <TextInput
                style={styles.captionInput}
                placeholder="Enter a caption (max 150 characters)..."
                placeholderTextColor="#7D7D7D"
                value={caption}
                onChangeText={(text) => {
                  if (text.length <= 150) {
                    setCaption(text);
                  }
                }}
                keyboardType="default"
                multiline
                autoCorrect
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={styles.button} 
                  onPress={() => {
                    setMedia(null); 
                    setCaption('');
                    setErrorMsg(null);
                  }}
                >
                  <Text style={styles.buttonText}>Delete Media</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={styles.button} 
                  onPress={handleUploadMedia}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Upload</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  placeholderCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFDE7',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  placeholderImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFB74D',
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  selectMediaButton: {
    backgroundColor: '#FFB74D',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  media: {
    width: 400,
    height: 400,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFCC80',
  },
  captionInput: {
    width: '100%',
    height: 100,
    borderWidth: 2,
    borderColor: '#FFCC80',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: '#FFFDE7',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
    fontSize: 16,
    color: '#424242',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#FFB74D',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'Roboto-Bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
