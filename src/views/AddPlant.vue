<template>
<ion-page>

<ion-header>
  <ion-toolbar color="success">
    <ion-title>Add Plant</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

  <!-- ชื่อพืช -->
  <ion-item>
    <ion-input v-model="name" placeholder="Plant Name"></ion-input>
  </ion-item>

  <!-- ความสูง -->
  <ion-item>
    <ion-input v-model="height" type="number" placeholder="Height (cm)"></ion-input>
  </ion-item>

  <!-- Upload รูป -->
  <input type="file" @change="handleFile" />

  <img v-if="imageUrl" :src="imageUrl" width="200" />

  <ion-button expand="block" @click="addPlant">
    Save Plant
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
IonItem,
IonInput,
IonButton
} from '@ionic/vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { db, storage } from '../firebase'

import { collection, addDoc } from "firebase/firestore"

import {
ref as storageRef,
uploadBytes,
getDownloadURL
} from "firebase/storage"

const name = ref("")
const height = ref("")
const imageFile = ref(null)
const imageUrl = ref("")

const router = useRouter()

function handleFile(event){

imageFile.value = event.target.files[0]

}

async function uploadImage(){

if(!imageFile.value) return ""

const fileRef = storageRef(storage,"plants/"+Date.now()+"_"+imageFile.value.name)

await uploadBytes(fileRef,imageFile.value)

const url = await getDownloadURL(fileRef)

return url

}

async function addPlant(){

try{

const image = await uploadImage()

await addDoc(collection(db,"plants"),{
name:name.value,
height:Number(height.value),
image:image
})

router.push("/plants")

}catch(err){

console.error(err)
alert("Error saving plant")

}

}

</script>