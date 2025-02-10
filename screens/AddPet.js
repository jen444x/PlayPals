import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AddPet = () => {
    const navigation = useNavigation();
    const [petName, setPetName] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petAge, setPetAge] = useState('');

    const handleAddPet = () => {
        // Replace this with your actual API call to save the pet details
        const newPet = {
            name: petName,
            breed: petBreed,
            age: petAge,
        };

        console.log('New pet added:', newPet);

        // Navigate back to HomeScreen or another relevant screen
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add a New Pet</Text>
            <TextInput
                style={styles.input}
                placeholder="Pet Name"
                value={petName}
                onChangeText={setPetName}
            />
            <TextInput
                style={styles.input}
                placeholder="Breed"
                value={petBreed}
                onChangeText={setPetBreed}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={petAge}
                onChangeText={setPetAge}
                keyboardType="numeric"
            />

            <Button title="Add Pet" onPress={handleAddPet} />
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
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        marginBottom: 15,
        borderColor: '#6D4C41',
        borderWidth: 1,
    },
});

export default AddPet;
