<template>
<ion-page>

<ion-header>
<ion-toolbar color="success">
<ion-title>Profile</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<!-- Profile Card -->

<ion-card class="profile-card">

<div class="profile-center">

<img
:src="avatar"
class="avatar"
@click="pickAvatar"
/>

<h2>{{ username }}</h2>

<p class="email">{{ userEmail }}</p>

<div class="stats">

<div>
<h3>{{ plantCount }}</h3>
<p>Plants</p>
</div>

<div>
<h3>{{ daysActive }}</h3>
<p>Days Active</p>
</div>

<div>
<h3>{{ recordCount }}</h3>
<p>Records</p>
</div>

</div>

</div>

</ion-card>


<!-- Edit Profile -->

<ion-card>

<ion-card-header>
<ion-card-title>✏️ Edit Profile</ion-card-title>
</ion-card-header>

<ion-card-content>

<ion-item>
<ion-label position="stacked">Name</ion-label>
<ion-input v-model="username"></ion-input>
</ion-item>

<ion-button expand="block" color="success" @click="saveProfile">
Save Profile
</ion-button>

</ion-card-content>

</ion-card>


<!-- Settings -->

<ion-card>

<ion-item button>
<ion-icon name="settings-outline" slot="start"></ion-icon>
<ion-label>Settings</ion-label>
</ion-item>

<ion-item button>
<ion-icon name="notifications-outline" slot="start"></ion-icon>
<ion-label>Notifications</ion-label>
</ion-item>

<ion-item button>
<ion-icon name="help-circle-outline" slot="start"></ion-icon>
<ion-label>Help & Support</ion-label>
</ion-item>

</ion-card>


<ion-button
expand="block"
color="danger"
@click="logout">

Logout

</ion-button>

</ion-content>
</ion-page>
</template>

<script setup>

import {
IonPage,
IonHeader,
IonToolbar,
IonTitle,
IonContent,
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
IonItem,
IonLabel,
IonInput,
IonButton,
IonIcon
} from '@ionic/vue'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { db } from '../firebase'

import {
collection,
getDocs,
doc,
setDoc,
getDoc
} from "firebase/firestore"

import { getAuth, signOut } from "firebase/auth"

import { Camera, CameraResultType } from '@capacitor/camera'


const router = useRouter()
const auth = getAuth()

const userEmail = ref("")
const username = ref("Student User")
const avatar = ref("https://i.pravatar.cc/150")

const plantCount = ref(0)
const recordCount = ref(0)
const daysActive = ref(0)


async function loadPlants(){

const querySnapshot = await getDocs(collection(db,"plants"))

plantCount.value = querySnapshot.size

}


async function loadRecords(){

const querySnapshot = await getDocs(collection(db,"plantGrowth"))

recordCount.value = querySnapshot.size

}


function calculateDaysActive(user){

if(!user?.metadata?.creationTime) return

const created = new Date(user.metadata.creationTime)

const today = new Date()

const diff = today - created

daysActive.value = Math.floor(diff / (1000 * 60 * 60 * 24))

}


// Upload avatar

async function pickAvatar(){

const image = await Camera.getPhoto({
quality:90,
allowEditing:false,
resultType:CameraResultType.DataUrl
})

avatar.value = image.dataUrl

}


// Save profile

async function saveProfile(){

const user = auth.currentUser

if(!user) return

await setDoc(doc(db,"users",user.uid),{

name:username.value,
avatar:avatar.value,
email:user.email

})

alert("Profile saved")

}


// Load profile

async function loadProfile(){

const user = auth.currentUser

if(!user) return

const docRef = doc(db,"users",user.uid)

const docSnap = await getDoc(docRef)

if(docSnap.exists()){

const data = docSnap.data()

username.value = data.name
avatar.value = data.avatar

}

}


// Logout

async function logout(){

await signOut(auth)

router.push("/")

}


onMounted(()=>{

const user = auth.currentUser

if(user){

userEmail.value = user.email

calculateDaysActive(user)

}

loadPlants()
loadRecords()
loadProfile()

})

</script>

<style>

.profile-card{
border-radius:20px;
box-shadow:0 8px 20px rgba(0,0,0,0.15);
padding:20px;
}

.profile-center{
text-align:center;
}

.avatar{
width:110px;
height:110px;
border-radius:50%;
margin-bottom:10px;
object-fit:cover;
border:4px solid #e8f5e9;
cursor:pointer;
}

.email{
color:#666;
}

.stats{
display:flex;
justify-content:space-around;
margin-top:15px;
}

.stats h3{
margin:0;
}

.stats p{
margin:0;
color:#777;
font-size:13px;
}

</style>