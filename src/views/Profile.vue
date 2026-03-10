<template>
<ion-page>

<!-- Header -->

<ion-header>
<ion-toolbar class="profile-header">
<ion-title>Profile</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="profile-bg">

<!-- Profile Card -->

<div class="profile-card">

<img
:src="avatar"
class="avatar"
@click="pickAvatar"
/>

<h2 class="username">{{ username }}</h2>

<p class="email">{{ userEmail }}</p>

<div class="stats">

<div class="stat-box">
<h3>{{ plantCount }}</h3>
<p>Plants</p>
</div>

<div class="stat-box">
<h3>{{ daysActive }}</h3>
<p>Days Active</p>
</div>

<div class="stat-box">
<h3>{{ recordCount }}</h3>
<p>Records</p>
</div>

</div>

</div>


<!-- Edit Profile -->

<ion-card class="edit-card">

<ion-card-header>
<ion-card-title>✏ Edit Profile</ion-card-title>
</ion-card-header>

<ion-card-content>

<ion-item class="input-item">
<ion-label position="stacked">Name</ion-label>
<ion-input v-model="username"></ion-input>
</ion-item>

<ion-button
expand="block"
class="save-btn"
@click="saveProfile">

Save Profile

</ion-button>

</ion-card-content>

</ion-card>


<!-- Settings -->

<ion-card class="settings-card">

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


<!-- Logout -->

<ion-button
expand="block"
class="logout-btn"
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
const avatar = ref("https://i.pravatar.cc/200")

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

async function pickAvatar(){

const image = await Camera.getPhoto({
quality:90,
allowEditing:false,
resultType:CameraResultType.DataUrl
})

avatar.value = image.dataUrl

}

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

.profile-bg{
--background:#f4fdf7;
padding:15px;
}

.profile-header{
--background:linear-gradient(135deg,#22c55e,#16a34a);
color:white;
}

.profile-card{

background:white;
border-radius:25px;
padding:30px 20px;
text-align:center;
box-shadow:0 15px 35px rgba(0,0,0,0.15);
margin-bottom:20px;

}

.avatar{

width:130px;
height:130px;
border-radius:50%;
object-fit:cover;
border:6px solid #e8f5e9;
box-shadow:0 6px 20px rgba(0,0,0,0.2);
margin-bottom:15px;
cursor:pointer;

}

.username{

font-size:22px;
font-weight:600;
margin-bottom:5px;

}

.email{

color:#777;
margin-bottom:20px;

}

.stats{

display:flex;
justify-content:space-between;
gap:10px;

}

.stat-box{

flex:1;
background:#f0fdf4;
padding:12px;
border-radius:15px;
box-shadow:0 4px 10px rgba(0,0,0,0.08);

}

.stat-box h3{

margin:0;
font-size:20px;
color:#16a34a;

}

.stat-box p{

margin:0;
font-size:12px;
color:#666;

}

.edit-card{

border-radius:20px;
box-shadow:0 10px 25px rgba(0,0,0,0.12);
margin-bottom:20px;

}

.settings-card{

border-radius:20px;
box-shadow:0 10px 25px rgba(0,0,0,0.12);
margin-bottom:20px;

}

.input-item{

margin-bottom:10px;

}

.save-btn{

--background:#22c55e;
--border-radius:12px;
margin-top:10px;

}

.logout-btn{

--background:#ef4444;
--border-radius:12px;
margin-top:10px;

}

</style>