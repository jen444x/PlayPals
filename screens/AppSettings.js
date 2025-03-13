import React, { useState } from 'react';
import { 
    View, 
    Text, 
    Switch, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    Image, 
    ActivityIndicator, 
    ToastAndroid, 
    Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const AppSettings = () => {
    const navigation = useNavigation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [userName, setUserName] = useState('User Name');
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Helper function for toast notifications
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            // For iOS, you might integrate a third-party toast library
            Alert.alert('', message);
        }
    };

    // Save settings locally with a simulated async operation
    const saveSettings = async () => {
        setIsLoading(true);
        try {
            // Simulate saving settings (e.g., AsyncStorage or API call)
            showToast('Settings Saved Successfully!');
        } catch (error) {
            console.error('Error saving settings', error);
            showToast('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset settings to default values
    const resetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'OK', 
                    onPress: () => {
                        setIsDarkMode(false);
                        setIsNotificationsEnabled(true);
                        setUserName('User Name');
                        setUserProfileImage(null);
                        showToast('Settings Reset to Default');
                    }
                },
            ]
        );
    };

    // Enhanced image picker with error handling and permission check
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                showToast('Permission to access media library is required!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setUserProfileImage(result.assets[0].uri);
                showToast('Profile image updated');
            }
        } catch (error) {
            console.error('Error picking image: ', error);
            showToast('An error occurred while picking the image');
        }
    };

    // Navigate to the user profile page
    const goToUserProfile = () => {
        navigation.navigate('UserProfile');
    };

    // Dynamic styles for dark mode
    const dynamicContainerStyle = {
        backgroundColor: isDarkMode ? '#333' : '#FFEDD5',
    };

    const dynamicTextStyle = {
        color: isDarkMode ? '#fff' : '#6D4C41',
    };

    return (
        <View style={[styles.container, dynamicContainerStyle]}>
            <Text style={[styles.title, dynamicTextStyle]}>App Settings</Text>

            {/* User Profile Preview */}
            <TouchableOpacity style={styles.profilePreview} onPress={goToUserProfile}>
                <View style={styles.profileInfo}>
                    {userProfileImage ? (
                        <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
                    ) : (
                        <Image source={require('../assets/avatar.png')} style={styles.profileImage} />
                    )}
                    <Text style={[styles.userName, dynamicTextStyle]}>{userName}</Text>
                </View>
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <View style={styles.settingRow}>
                <Text style={[styles.settingText, dynamicTextStyle]}>Dark Mode</Text>
                <Switch 
                    value={isDarkMode} 
                    onValueChange={setIsDarkMode} 
                />
            </View>

            {/* Notifications Toggle */}
            <View style={styles.settingRow}>
                <Text style={[styles.settingText, dynamicTextStyle]}>Enable Notifications</Text>
                <Switch 
                    value={isNotificationsEnabled} 
                    onValueChange={setIsNotificationsEnabled} 
                />
            </View>

            {/* Save Settings */}
            <TouchableOpacity style={styles.saveButton} onPress={saveSettings} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                )}
            </TouchableOpacity>

            {/* Reset Settings */}
            <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
                <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>

            {/* Change Profile Image */}
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
                <Text style={[styles.pickImageButtonText, dynamicTextStyle]}>Change Profile Image</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={[styles.backButtonText, dynamicTextStyle]}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    profilePreview: {
        marginBottom: 20,
        width: '100%',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        borderColor: '#6D4C41',
        borderWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    settingText: {
        fontSize: 18,
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#F4A261',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 10,
    },
    saveButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    resetButton: {
        marginTop: 10,
    },
    resetButtonText: {
        fontSize: 16,
        color: '#D9534F',
    },
    pickImageButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 25,
        backgroundColor: '#E9C46A',
    },
    pickImageButtonText: {
        fontSize: 16,
    },
    backButton: {
        marginTop: 10,
    },
    backButtonText: {
        fontSize: 16,
    },
});

export default AppSettings;
