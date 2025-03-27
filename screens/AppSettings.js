import React, { useContext, useState } from 'react';
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
    Platform, 
    LayoutAnimation, 
    UIManager 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext'; // adjust the path accordingly
import HomeScreen from './HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Reusable Setting Row component with icon and switch
const SettingRow = ({ iconName, label, value, onValueChange, dynamicTextStyle }) => (
    <View style={styles.settingRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={iconName} size={20} color="#FDD835" style={{ marginRight: 8 }} />
            <Text style={[styles.settingText, dynamicTextStyle]}>{label}</Text>
        </View>
        <Switch value={value} onValueChange={onValueChange} />
    </View>
);

const AppSettings = () => {
    const navigation = useNavigation();
    const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
    const [userName, setUserName] = useState('Fluffy Friend');
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [userLocation, setUserLocation] = useState('Unknown Location');
    const [isLoading, setIsLoading] = useState(false);

    // Helper for toast notifications
    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('', message);
        }
    };

    // Simulate saving settings with a timeout
    const saveSettings = () => {
        setIsLoading(true);
        setTimeout(() => {
            showToast('Settings Saved Successfully!');
            setIsLoading(false);
        }, 1500);
    };

    // Reset settings to default values (only updating local state)
    const resetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'OK', 
                    onPress: () => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setIsDarkMode(false);
                        setIsNotificationsEnabled(true);
                        setUserName('Fluffy Friend');
                        setUserProfileImage(null);
                        setUserLocation('Unknown Location');
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
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to the user profile page
    const goToUserProfile = () => {
        navigation.navigate('UserProfile');
    };

    // Logout functionality with confirmation
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            // Remove any other saved info like email, username, etc.
            
            // Navigate to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Unable to log out.");
          }
    };

    // Global pet-themed dynamic styles
    const dynamicContainerStyle = {
        backgroundColor: isDarkMode ? '#252526' : '#FFF8E1', // Dark chocolate vs. light cream
    };

    const dynamicTextStyle = {
        color: isDarkMode ? '#0BA385' : '#5D4037', // Light yellow vs. warm brown
    };

    return (
        <View style={[styles.container, dynamicContainerStyle]}>
            <Text style={[styles.title, dynamicTextStyle]}>Pet App Settings</Text>

            {/* User Profile Preview */}
            <TouchableOpacity style={styles.profilePreview} onPress={goToUserProfile}>
                <View style={styles.profileInfo}>
                    {userProfileImage ? (
                        <Image source={{ uri: userProfileImage }} style={styles.profileImage} />
                    ) : (
                        <Image source={require('../assets/avatar.png')} style={styles.profileImage} />
                    )}
                    <View>
                        <Text style={[styles.userName, dynamicTextStyle]}>{userName}</Text>
                        <Text style={[styles.userLocation, dynamicTextStyle]}>Location: {userLocation}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Settings Options */}
            <SettingRow 
                iconName="moon" 
                label="Dark Mode" 
                value={isDarkMode} 
                onValueChange={(value) => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsDarkMode(value);
                }}
                dynamicTextStyle={dynamicTextStyle}
            />
            <SettingRow 
                iconName="notifications" 
                label="Enable Notifications" 
                value={isNotificationsEnabled} 
                onValueChange={(value) => setIsNotificationsEnabled(value)}
                dynamicTextStyle={dynamicTextStyle}
            />

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
                <Text style={[styles.pickImageButtonText,isDarkMode ? { color: '#fff' } : dynamicTextStyle]}>Change Profile Image</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('PetHome')}>
                <Text style={[styles.backButtonText, dynamicTextStyle]}>Go Back</Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={[styles.logoutButtonText, isDarkMode ? { color: '#fff' } : dynamicTextStyle]}>
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 25,
        letterSpacing: 1.2,
    },
    profilePreview: {
        width: '100%',
        padding: 15,
        backgroundColor: '#FFECB3',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FBC02D',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#FBC02D',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    userLocation: {
        fontSize: 16,
        marginTop: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FDD835',
        marginBottom: 15,
    },
    settingText: {
        fontSize: 18,
    },
    saveButton: {
        backgroundColor: '#FF8A65',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    resetButton: {
        marginTop: 15,
    },
    resetButtonText: {
        fontSize: 16,
        color: '#D32F2F',
    },
    pickImageButton: {
        marginTop: 20,
        padding: 12,
        borderRadius: 30,
        backgroundColor: '#FBC02D',
        width: '100%',
        alignItems: 'center',
    },
    pickImageButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
    },
    backButtonText: {
        fontSize: 16,
    },
    logoutButton: {
        marginTop: 20,
        padding: 12,
        borderRadius: 30,
        backgroundColor: '#E57373',
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AppSettings;
