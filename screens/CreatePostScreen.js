import * as ImagePicker from 'expo-image-picker'
import { useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, Image, Text, Alert } from 'react-native'

export default function PersonalFeedScreen() {
    // State to store the selected image URI
    const [image, setImage] = useState('')
    
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
            
            //If an image is selected, update state with its URI
            if(!result.canceled) {
                setImage(result.assets[0].uri)
            }
        } catch (error) {
            console.error("Error opening image picker:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Display selected image if it exists */}
            { image && <Image source={{ uri: image }} style={styles.image} /> }
            <View id='buttons' style={styles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={ handleSelectImagePress }>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={ () => setImage('') }>
                    <Text style={styles.buttonText}>Delete Image</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

// Styling for image selector
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
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