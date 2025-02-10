import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();

    // Assuming a function fetchUserPets() that fetches the user's pets from an API or database
    const [pets, setPets] = useState([]);

    useEffect(() => {
        // Simulating a fetch operation
        const fetchUserPets = async () => {
            // This would be replaced by your API call or data fetching logic
            const userPets = await [
                { id: '1', name: 'Buddy', breed: 'Golden Retriever' },
                { id: '2', name: 'Max', breed: 'Bulldog' },
            ];
            setPets(userPets);
        };

        fetchUserPets();
    }, []);

    const renderPetItem = ({ item }) => (
        <TouchableOpacity
            style={styles.petCard}
            onPress={() => navigation.navigate('PetProfile', { petId: item.id })}
        >
            <Image
               // source={require('../assets/pet.png')} // Add a placeholder image for pets
                style={styles.petImage}
            />
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back! 🐾</Text>
            <Text style={styles.subtitle}>Pick a pet profile to manage</Text>

             (
                <View style={styles.noPetsContainer}>
                    
                    <TouchableOpacity style={styles.addPetButton}
                        onPress={() => navigation.navigate('AddPet')}
                    >
                        <Text style={styles.addPetText}>Add a Pet</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pets}
                    renderItem={renderPetItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.petList}
                />
            )
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEDD5',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6D4C41',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6D4C41',
        marginBottom: 20,
    },
    petList: {
        flexGrow: 1,
        justifyContent: 'center',
        width: '100%',
    },
    petCard: {
        backgroundColor: '#F4A261',
        borderRadius: 10,
        marginVertical: 10,
        padding: 15,
        alignItems: 'center',
        width: '100%',
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    petName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6D4C41',
    },
    petBreed: {
        fontSize: 16,
        color: '#6D4C41',
    },
    noPetsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    noPetsText: {
        fontSize: 18,
        color: '#6D4C41',
        marginBottom: 15,
    },
    addPetButton: {
        backgroundColor: '#E76F51',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    addPetText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default HomeScreen;
