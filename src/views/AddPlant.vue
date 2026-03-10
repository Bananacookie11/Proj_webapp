<template>
<ion-page>

<ion-header>
  <ion-toolbar color="success">
    <ion-title>Add Plant</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

  <!-- Plant Name -->
  <ion-item>
    <ion-input
      v-model="name"
      placeholder="Plant Name">
    </ion-input>
  </ion-item>

  <!-- Upload Photo -->
  <div class="photo-box">

    <input type="file" accept="image/*" @change="handleFile" />

    <img
      v-if="imageUrl"
      :src="imageUrl"
      class="preview"
    />

  </div>

  <!-- Health Status -->
  <ion-item>
    <ion-label>Health Status</ion-label>

    <ion-select v-model="health">

      <ion-select-option value="Healthy">
        Healthy
      </ion-select-option>

      <ion-select-option value="Warning">
        Warning
      </ion-select-option>

      <ion-select-option value="Sick">
        Sick
      </ion-select-option>

    </ion-select>
  </ion-item>

  <!-- Date & Time -->
  <ion-item>
    <ion-label>Date & Time</ion-label>

    <ion-datetime
      v-model="dateTime"
      presentation="date-time">
    </ion-datetime>

  </ion-item>

  <!-- Notes -->
  <ion-item>
    <ion-textarea
      v-model="notes"
      placeholder="Notes about the plant">
    </ion-textarea>
  </ion-item>

  <!-- Save Button -->
  <ion-button
    expand="block"
    color="success"
    @click="addPlant">

    Save Plant

  </ion-button>

  <!-- Cancel Button -->
  <ion-button
    expand="block"
    fill="outline"
    color="medium"
    @click="router.back()">

    Cancel

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
IonButton,
IonSelect,
IonSelectOption,
IonLabel,
IonDatetime,
IonTextarea
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

const router = useRouter()

const name = ref("")
const health = ref("Healthy")
const dateTime = ref("")
const notes = ref("")

const imageFile = ref(null)
const imageUrl = ref("")

function handleFile(event){

const file = event.target.files[0]

if(!file) return

imageFile.value = file

imageUrl.value = URL.createObjectURL(file)

}

async function uploadImage(){

if(!imageFile.value) return ""

const fileRef = storageRef(
storage,
"plants/"+Date.now()+"_"+imageFile.value.name
)

await uploadBytes(fileRef,imageFile.value)

const url = await getDownloadURL(fileRef)

return url

}

async function addPlant(){

try{

const image = await uploadImage()

await addDoc(collection(db,"plants"),{

name:name.value,
health:health.value,
datetime:dateTime.value,
notes:notes.value,
image:image

})

alert("Plant saved successfully")

router.push("/plants")

}catch(err){

console.error(err)

alert("Error saving plant")

}

}

</script>

<style>

.photo-box{
margin:15px 0;
text-align:center;
}

.preview{
width:200px;
margin-top:10px;
border-radius:10px;
}

</style>