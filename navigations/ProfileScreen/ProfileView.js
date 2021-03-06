import React, { Component } from "react";
import { View, Text, Image} from "react-native";
import SafeAreaView from "react-native-safe-area-view";
import { Icon} from 'react-native-elements';
import styles from "./styles";
import { List, ListItem, Left, Body, Right, Thumbnail} from 'native-base';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
  } from "react-native-responsive-screen";
  import * as ImagePicker from 'expo-image-picker';
  import {Permissions} from 'expo';
  import firebase from '../../config/firebase';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { connect } from 'react-redux';
import {updateFirstName} from '../../actions/Profile/actionCreators';
import {updateLastName} from '../../actions/Profile/actionCreators';
import {updateEmail} from '../../actions/Profile/actionCreators';
import {updateStreet} from '../../actions/Profile/actionCreators';
import {updateCity} from '../../actions/Profile/actionCreators';
import {updateProvince} from '../../actions/Profile/actionCreators';
import {updatePostalCode} from '../../actions/Profile/actionCreators';
import {updateAvatar} from '../../actions/Profile/actionCreators';
import {updatePhone} from '../../actions/Profile/actionCreators';
import CircleOverlay from '../../components/CircleOverlay';
import uuid from 'uuid';


class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
        user: {},
        address: {},
        street: "",
        city: "",
        province: "",
        postalCode: "",
        phone: "",
        image: null,
			uploading: false,
			displayConfirmButton: false,
			googleResponse: null,
    };
  }

  toggleProfile = () => {
    this.props.navigation.navigate("Profile");
  }

  togglePhoneEdit = () => {
    this.props.navigation.navigate("PhoneEdit");
  }

  toggleNameEdit = () => {
    this.props.navigation.navigate("NameEdit");
  }

  toggleEmailEdit = () => {
    this.props.navigation.navigate("EmailEdit");
  }

  toggleAddressEdit = () => {
    this.props.navigation.navigate("AddressEdit");
  }

  async componentDidMount (){
        let db = firebase.firestore();
        try {
            const addressData = []
            db.collection("users")
			.doc(firebase.auth().currentUser.uid)
			.get()
			.then(u => {
				if (u.exists) {
                    
                    this.setState({ user: u.data()});
                    console.log(this.state.user)
                    this.props.updateFirstName(this.state.user.firstName)
                    this.props.updateLastName(this.state.user.lastName)
                    this.props.updateEmail(this.state.user.email)

                    if(u.get("address") != null){
                        var address = {
                            street: u.data().address.street,
                            city: u.data().address.city,
                            province: u.data().address.province,
                            postalCode: u.data().address.postalCode
                        }
                        addressData.push(address)
                        var s = u.data().address.street
                        var c = u.data().address.city
                        var pro = u.data().address.province
                        var pos = u.data().address.postalCode
                        this.setState({address: addressData, street: s, city: c, province: pro, postalCode: pos})
                       
                        this.props.updateStreet(this.state.street)
                        this.props.updateProvince(this.state.province)
                        this.props.updatePostalCode(this.state.postalCode)
                        this.props.updateAvatar(this.state.user.profilePhoto)
                        this.props.updateCity(this.state.city)
                        console.log(this.state.city)

                    }
                    else{
                      this.props.updateStreet("")
                        this.props.updateProvince("")
                        this.props.updatePostalCode("")
                        this.props.updateAvatar(this.state.user.profilePhoto)
                        this.props.updateCity("")
                    }
                    if(u.get("phone") != null){
                      var phone = u.data().phone
                      this.setState({phone: phone})
                      this.props.updatePhone(this.state.phone)
                    }
                   
                }
                
            });
        }
        catch (error) {
            console.log(error);
          }
  }

 
  

  chooseAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
      });
  
      console.log(result);

      if (!result.cancelled) {
        // let encodedUri = await localImageToBase64Encode(result.uri);
        let downloadUrl = await uploadImageAsync(result.uri)
        this.props.updateAvatar(downloadUrl)
        let db = firebase.firestore();
    let batch = db.batch();

    //Ref to user
    let userRef = db.collection('users').doc(firebase.auth().currentUser.uid);
    batch.update(userRef, { profilePhoto: downloadUrl});

    batch.commit()
      .then((result) => {
      })
      .catch((error) => {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
        console.log(error);
      });
      }
  }

  

  render() {
    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <View style={styles.iconWrapper}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.openDrawer()}>
                    <Icon
                        type="material"
                        name="menu"
                        size={30}
                        color="#fff"
                        containerStyle={styles.drawerIcon}
                    />
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.titleWrapper}>
                    <Text style={styles.textTitle}>Profile</Text>
                </View>
            </View>
        </View>
          
          <View style={styles.avatarContainer}>
          <CircleOverlay/>
          <TouchableWithoutFeedback onPress={this.chooseAvatar}>
              <Image style={styles.avatar} source={{uri: this.props.avatarUrl}}
              onPress={this.chooseAvatar}/>
              {/* <Icon 
              name='add-a-photo' 
              type='material'
              iconStyle ={styles.addPhoto}
              /> */}
               </TouchableWithoutFeedback>
          </View>
         
              <List style={styles.listWrapper}>
              <ListItem style={styles.itemWrapper} onPress={this.toggleNameEdit} >
              <Left>
               <Icon name='person' type='material' color = "#87D5FA"
               iconStyle={styles.itemIcon}/>
              </Left>
              <Body style={styles.body}>
                <Text style={styles.hint}>Name</Text>
                <Text style={styles.itemText}>{this.props.firstName} {this.props.lastName}</Text>
              </Body>
              <Right style={styles.right}>
                  <Icon name='edit' type='material'  color="#87D5FA" />
              </Right>
            </ListItem>
            </List>
            <List style={styles.listWrapper}>
            <ListItem style={styles.itemWrapper} onPress={this.toggleEmailEdit} >
              <Left>
              <Icon name='email' type='material-community' color = "#87D5FA"
              iconStyle={styles.itemIcon}/>
              </Left>
              <Body style={styles.body}>
              <Text style={styles.hint}>Email</Text>
                <Text style={styles.itemText}>{this.props.email}</Text>
              </Body>
              <Right style={styles.right}>
                  <Icon name='edit' type='material'  color="#87D5FA"/>
              </Right>
            </ListItem>
            </List>
            <List style={styles.listWrapper}>
            <ListItem style={styles.itemWrapper} onPress={this.toggleAddressEdit} >
              <Left>
              <Icon name='map-marker' type='material-community' color = "#87D5FA"
              iconStyle={styles.itemIcon}/>
              </Left>
              <Body style={styles.body}>
              <Text style={styles.hint}>Address</Text>
              {this.props.street == "" ? (
                <Text style={styles.hintText}>Add address to complete profile</Text>
              ):
                <Text style={styles.itemText}>{this.props.street},  {this.props.postalCode}</Text>}
              </Body>
              <Right style={styles.right}>
                  <Icon name='edit' type='material'  color="#87D5FA"/>
              </Right>
            </ListItem>
            </List>
            <List style={styles.listWrapper}>
            <ListItem style={styles.itemWrapper} onPress={this.togglePhoneEdit} >
              <Left>
              <Icon name='cellphone-iphone' type='material-community' color = "#87D5FA"/>
              </Left>
              <Body style={styles.body}>
                <Text style={styles.hint}>Phone</Text>
                {this.props.phone == "" ? (
                <Text style={styles.hintText}>Add phone number</Text>
              ):
                <Text style={styles.itemText}>{this.props.phone}</Text>}
              </Body>
              <Right style={styles.right}>
                  <Icon name='edit' type='material'  color="#87D5FA"/>
              </Right>
            </ListItem>
              </List>
      </SafeAreaView>
    );
  }
}

function mapStateToProps (state){
  return{
      firstName: state.editNameReducer.firstName,
      lastName: state.editNameReducer.lastName,
      email: state.editEmailReducer.email,
      street: state.editAddressReducer.street,
      city: state.editAddressReducer.city,
      province: state.editAddressReducer.province,
      postalCode: state.editAddressReducer.postalCode,
      avatarUrl: state.editAvatarReducer.avatarUrl,
      phone: state.editPhoneReducer.phone,
  }; 
}

function mapDispatchToProps (dispatch)  {
  return {
      updateFirstName: (f) => dispatch(updateFirstName(f)),
      updateLastName: (l) => dispatch(updateLastName(l)),
      updateEmail: (e) => dispatch(updateEmail(e)),
      updateStreet: (s) => dispatch(updateStreet(s)),
      updateCity: (c) => dispatch(updateCity(c)),
      updateProvince: (pro) => dispatch(updateProvince(pro)),
      updatePostalCode: (pos) => dispatch(updatePostalCode(pos)),
      updateAvatar: (avatar) => dispatch(updateAvatar(avatar)),
      updatePhone: (p) => dispatch(updatePhone(p)),
  };
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());

  const snapshot = await ref.put(blob);

  blob.close();

  return await ref.getDownloadURL();
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
