import React, { useState, useEffect, forwardRef } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Input } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TouchableOpacity } from 'react-native';
import { Button as PaperButton, Provider as PaperProvider, TextInput, Card, Paragraph, DefaultTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE', // Example primary color from Material Design palette
    accent: '#03DAC6',  // Example accent color from Material Design palette
  },
};

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Add Contact" component={AddContactScreen} />
        <Stack.Screen name="View Contacts" component={ViewContactsScreen} />
        <Stack.Screen name="Contact Details" component={ContactDetailsScreen} />
        <Stack.Screen name="Update Contact" component={UpdateContactScreen} />
      </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const HomeScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    const storedContacts = await AsyncStorage.getItem('contacts');
    const parsedContacts = storedContacts ? JSON.parse(storedContacts) : [];
    setContacts(parsedContacts);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );


  return (
    <View style={styles.container}>
      <PaperButton mode="contained" onPress={() => navigation.navigate('Add Contact')} style={styles.button}>
        Add New Contact
      </PaperButton>
      <PaperButton mode="contained" onPress={() => navigation.navigate('View Contacts')} style={styles.button}>
        View Contacts
      </PaperButton>
      <View style={styles.circlesContainer}>
      {contacts.map((contact, index) => {
        console.log(`Rendering circle for contact ${index}:`, contact);
        return (
          <View key={index} style={[styles.circle, {backgroundColor: gradientColors[index % gradientColors.length]}]} />
        );
      })}
      </View>
    </View>
  );
};

const AddContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [dateMet, setDateMet] = useState(new Date());
  const [sparks, setSparks] = useState('');
  const [howWeMet, setHowWeMet] = useState('');

  const saveContact = async () => {
    const contact = { name, birthdate, dateMet, sparks, howWeMet };
    const storedContacts = await AsyncStorage.getItem('contacts');
    const contacts = storedContacts ? JSON.parse(storedContacts) : [];
    contacts.push(contact);
    await AsyncStorage.setItem('contacts', JSON.stringify(contacts));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput label="Name" value={name} onChangeText={setName} />
      <Text>Birthday</Text>
      <DateTimePicker value={birthdate} onChange={(event, date) => setBirthdate(date)} mode="date" />
      <Text>Date First Met</Text>
      <DateTimePicker value={dateMet} onChange={(event, date) => setDateMet(date)} mode="date" />
      <Input placeholder="Sparks" value={sparks} onChangeText={setSparks} />
      <Input placeholder="How We Met" value={howWeMet} onChangeText={setHowWeMet} />
      <PaperButton mode="contained" onPress={saveContact}>
        Save Contact
      </PaperButton>
    </View>
  );
};

const ViewContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    const storedContacts = await AsyncStorage.getItem('contacts');
    const parsedContacts = storedContacts ? JSON.parse(storedContacts) : [];
    setContacts(parsedContacts);
  };

  // Fetch contacts initially
  useEffect(() => {
    fetchContacts();
  }, []);

  // Refetch contacts whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  return (
    <SwipeListView
      data={contacts}
      renderItem={({ item }) => (
        <CustomListItem
          item={item}
          onPress={() => navigation.navigate('Contact Details', { contact: item })}
        />
      )}
      leftOpenValue={75}
      rightOpenValue={-75}
      onRowDidOpen={(rowKey, rowMap) => {
        Alert.alert(
          'Delete Contact',
          `Are you sure you want to delete ${contacts[rowKey].name} from your contact list?`,
          [
            {
              text: 'No',
              onPress: () => rowMap[rowKey].closeRow(),
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: async () => {
                const updatedContacts = [...contacts];
                updatedContacts.splice(rowKey, 1);
                await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));
                setContacts(updatedContacts);
              },
            },
          ],
          { cancelable: false }
        );
      }}
    />
  );
};

const ContactDetailsScreen = ({ route, navigation }) => {
  const { contact } = route.params;

  useFocusEffect(
    React.useCallback(() => {
      // Function to fetch the updated contact data
      const fetchUpdatedContact = async () => {
        const storedContacts = await AsyncStorage.getItem('contacts');
        let contacts = storedContacts ? JSON.parse(storedContacts) : [];
        const updatedContact = contacts.find((c) => c.name === contact.name);
        if (updatedContact) {
          // Update your state or variable that holds the contact details
        }
      };
  
      fetchUpdatedContact();
    }, [])
  );  

  return (
    <View style={styles.container}>
      <Text>Name: {contact.name}</Text>
      <Text>Age: {calculateAge(contact.birthdate)}</Text>
      <Text>Birthday: {new Date(contact.birthdate).toLocaleDateString()}</Text>
      <Text>Date First Met: {new Date(contact.dateMet).toLocaleDateString()}</Text>
      <Text>How We Met: {contact.howWeMet}</Text>
      <Text>Sparks: {contact.sparks}</Text>
      <Button
        title="Delete Contact"
        onPress={async () => {
          try {
            const storedContacts = await AsyncStorage.getItem('contacts');
            const contacts = storedContacts ? JSON.parse(storedContacts) : [];
            const index = contacts.findIndex((c) => c.name === contact.name);
            if (index !== -1) {
              contacts.splice(index, 1);
              await AsyncStorage.setItem('contacts', JSON.stringify(contacts));
            }
              navigation.goBack();  // Navigate back to the list of contacts after deletion
          }catch (error) {
            console.error("Error deleting contact:", error);
          }
        }}
      />
      <Button
        title="Update"
        onPress={() => navigation.navigate('Update Contact', { contact })}
      />

    </View>
  );
};

const UpdateContactScreen = ({ route, navigation }) => {
  const { contact } = route.params;
  const [lastInteractionDate, setLastInteractionDate] = useState(new Date());
  const [lastInteractionDetails, setLastInteractionDetails] = useState('');

  const handleUpdate = async () => {
    const storedContacts = await AsyncStorage.getItem('contacts');
    let contacts = storedContacts ? JSON.parse(storedContacts) : [];
    const contactIndex = contacts.findIndex((c) => c.name === contact.name);
  
    if (contactIndex !== -1) {
      const updatedContact = {
        ...contacts[contactIndex],
        lastInteractionDate,    // Assuming you have this field in your contact object
        lastInteractionDetails  // Assuming you have this field in your contact object
      };
      contacts[contactIndex] = updatedContact;
      await AsyncStorage.setItem('contacts', JSON.stringify(contacts));
      navigation.goBack();
    }
  };
  

  return (
    <View style={styles.container}>
      <DateTimePicker
        value={lastInteractionDate}
        onChange={(event, date) => setLastInteractionDate(date)}
        mode="date"
      />
      <TextInput
        label="Details of Last Interaction"
        value={lastInteractionDetails}
        onChangeText={setLastInteractionDetails}
      />
      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
};


const CustomListItem = forwardRef(({ item, onPress }, ref) => {
  return (
    <Card onPress={onPress} style={styles.card}>
    <TouchableOpacity onPress={onPress}>
      <Card.Content>
      <View style={styles.contactContainer}>
        <Text>Name: {item.name}</Text>
        <Text>Age: {calculateAge(item.birthdate)}</Text>
        <Text>Birthday: {new Date(item.birthdate).toLocaleDateString()}</Text>
      </View>
      </Card.Content>
    </TouchableOpacity>
    </Card>
  );
});

const calculateAge = (birthdate) => {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const Stack = createStackNavigator();

const gradientColors = ['#FF0000', '#FF33CC', '#9933FF', '#6600FF', '#0000FF'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
  button: {
    marginBottom: 16, // or however much space you want
  },
  circlesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 5,
  },
});

export default App;
