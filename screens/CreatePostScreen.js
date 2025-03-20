import * as ImagePicker from 'expo-image-picker'
import { useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, Image, Text, Alert, TextInput } from 'react-native'
import { Video } from 'expo-av';

export default function PersonalFeedScreen() {
    // State to store the selected image URI
    const [image, setImage] = useState('')
    const [media, setMedia] = useState(null);
    // State for caption
    const [caption, setCaption] = useState('');

    const [videoDimensions, setVideoDimensions] = useState({ width: 400, height: 400 });
    
    useEffect(() => {
        // Request permission to access library
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Please allow access to your photo library to select an image.");
            }
        })();
    }, []);

    // Function to handle selecting an image from the device's image library
    const handleSelectImagePress = async() => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        // If permission is not granted, alert user
        if (status !== 'granted') {
            Alert.alert("Permission Denied", "You need to enable access to your photos in Settings.");
            return;
        }
        
        try {
            //console.log("Opening image picker...")
            let result = await ImagePicker.launchImageLibraryAsync({
                //Allows all media types to be selected including photos and videos
                mediaTypes: ImagePicker.MediaTypeOptions.All, 
                allowsEditing: true,
                aspect: [1, 1],
                quality:1
            });

            //console.log("Picker result:", result);
            
            //If an image or video is selected, update state with its URI
            if(!result.canceled) {
            
                //const selectedAsset = result.assets[0];
                //console.log("Selected asset:", selectedAsset);

                if (result.assets[0].type === 'image') {
                    setMedia({ uri: result.assets[0].uri, type: 'image' });
                } else if (result.assets[0].type === 'video') {
                    setMedia({ uri: result.assets[0].uri, type: 'video' });
                }
            }
        } catch (error) {
            console.error("Error opening image picker:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Display selected image or video if it exists */}
            {/* image && <Image source={{ uri: image }} style={styles.image} /> */}
            {media && media.type === 'image' && (
                <Image source={{ uri: media.uri }} style={styles.image} />
            )}
            {media && media.type === 'video' && (
                <Video
                    source={{ uri: media.uri }}
                    style={{
                        width: videoDimensions.width,
                        height: videoDimensions.height,
                        aspectRatio: videoDimensions.width / videoDimensions.height,
                        borderRadius: 10,
                        marginBottom: 20,
                    }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                    //onLoad={(data) => {
                    //    setVideoDimensions({
                    //        width: data.naturalSize.width || 400,
                    //        height: data.naturalSize.height || 400
                    //    });
                    //}}
                />
            )}
            {/* Caption input */}
            {media && (
                <TextInput
                    style={styles.captionInput}
                    placeholder="Enter a caption..."
                    placeholderTextColor="#999"
                    value={caption}
                    onChangeText={(text) => {
                        if (text.length <= 150) {
                            setCaption(text);
                        }
                    }}
                    keyboardType="default" 
                    multiline={true}
                    autoCorrect={true} 
                    allowFontScaling={true} 
                />
            )}
            <View id='buttons' style={styles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={ handleSelectImagePress }>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.button} 
                    onPress={ () => {
                        setMedia(null); 
                        setCaption(''); 
                    }}
                >
                    <Text style={styles.buttonText}>Delete Image</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

// Styling for image/video selector
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    image: {
        width: 400,
        height: 400,
        borderRadius: 10,
        marginBottom: 20,
    },
    captionInput: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: 'white',
        fontFamily: 'System',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10, 
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})