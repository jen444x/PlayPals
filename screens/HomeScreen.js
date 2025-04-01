import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [pets, setPets] = useState([]);

    useEffect(() => {
        const fetchUserPets = async () => {
            // Replace this simulated data with your actual API call or data fetching logics
            /*
            const userPets = [
                { id: '1', name: 'Buddy', breed: 'Golden Retriever' },
                { id: '2', name: 'Max', breed: 'Bulldog' },
            ];
            */
            try {
                console.log("Hello")
                const userId = await AsyncStorage.getItem('userId'); // or pass it as a prop
                console.log("Home UserID", userId)
                const response = await fetch(`https://test2.playpals-app.com/api/pets/${userId}`);
            
                if (!response.ok) {
                  throw new Error('Failed to fetch pets');
                }
            
                const data = await response.json();
                setPets(data); // Assuming backend returns { pets: [...] }
                console.log(data)
              } catch (error) {
                console.error('Error fetching pets:', error);
                Alert.alert('Error', 'Could not load your pets.');
              }
            //setPets(userPets);
        };

        fetchUserPets();
    }, []);

    const renderPetItem = ({ item }) => (
        <TouchableOpacity
            style={styles.petCard}
            onPress={() => navigation.navigate('PetProfile', { petId: item.petId })}
        >
            <Image
                // Ensure you have a placeholder pet image in your assets folder
                source={require('../assets/pet.png')}
                style={styles.petImage}
            />
            <Text style={styles.petName}>{item.petName}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../assets/petBackground.jpg')}
            style={styles.container}
        >
            <Text style={styles.title}>Welcome Back! 🐾</Text>
            <Text style={styles.subtitle}>Pick a pet profile to manage and have some fun!</Text>
            <TouchableOpacity
                style={styles.addPetButton}
                onPress={() => navigation.navigate('AddPet')}
            >
                <Text style={styles.addPetText}>Add a Pet</Text>
            </TouchableOpacity>
            {pets.length === 0 ? (
                <View style={styles.noPetsContainer}>
                    <Text style={styles.noPetsText}>No pets found. Let's add one!</Text>
                </View>
            ) : (
                <FlatList
                    data={pets}
                    renderItem={renderPetItem}
                    keyExtractor={(item) => item.petId.toString()}
                    contentContainerStyle={styles.petList}
                />
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#4A4A4A',
        textShadowColor: '#fff',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 5,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#4A4A4A',
        marginBottom: 20,
    },
    petList: {
        flexGrow: 1,
        justifyContent: 'center',
        width: '100%',
    },
    petCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 15,
        marginVertical: 10,
        padding: 20,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    petName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    petBreed: {
        fontSize: 16,
        color: '#555',
    },
    noPetsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    noPetsText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 15,
    },
    addPetButton: {
        backgroundColor: '#FF6F61',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addPetText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default HomeScreen;
