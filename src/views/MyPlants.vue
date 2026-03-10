```vue
<template>

<ion-page>
<ion-content class="main-bg">

<!-- HEADER -->

<div class="smart-header">
<h1>🌿 My Plants</h1>
<p>Manage your plant collection</p>
</div>

<!-- SEARCH -->

<div class="search-box">
<ion-searchbar
v-model="search"
debounce="300"
placeholder="Search plants..."
></ion-searchbar>
</div>

<!-- STATS -->

<div class="stats">

<span class="stat-pill total">
🌿 {{ totalPlants }}
</span>

<span class="stat-pill healthy">
🟢 {{ healthyCount }}
</span>

<span class="stat-pill warning">
🟡 {{ warningCount }}
</span>

<span class="stat-pill critical">
🔴 {{ criticalCount }}
</span>

</div>

<!-- EMPTY -->

<div v-if="filteredPlants.length === 0" class="no-plants">
🌱 No plants found
</div>

<!-- PLANT LIST -->

<ion-card
v-for="plant in filteredPlants"
:key="plant.id"
class="plant-card"
>

<div class="plant-row">

<img
:src="plant.image || defaultImage"
class="plant-img"
@click="openPlantDetail(plant)"
/>

<div class="plant-info">

<h2>{{ plant.name }}</h2>

<ion-progress-bar
:value="plant.health / 100"
:color="getHealthColor(plant.status)"
></ion-progress-bar>

<small class="last-check">
Last check: {{ plant.datetime }}
</small>

<div class="water-status">

<span v-if="plant.water === 'watered'" class="watered">
💧 Watered
</span>

<span v-else class="unwater">
⚠ Needs Water
</span>

</div>

</div>

<div class="status" :class="plant.status">
{{ plant.status }}
</div>

</div>

</ion-card>

<!-- ADD BUTTON -->

<ion-fab vertical="bottom" horizontal="end" slot="fixed">
<ion-fab-button class="fab-btn" @click="openModal">
<ion-icon :icon="add"></ion-icon>
</ion-fab-button>
</ion-fab>

<!-- ADD PLANT MODAL -->

<ion-modal :is-open="showModal">

<ion-header>
<ion-toolbar color="success">
<ion-title>🌱 Add New Plant</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<ion-input
label="Plant Name"
label-placement="floating"
fill="outline"
v-model="newPlant.name">
</ion-input>

<br>

<div v-if="previewImage" class="image-preview">
<img :src="previewImage"/>
</div>

<ion-button expand="block" color="success" @click="pickImage">
📁 Choose Photo
</ion-button>

<ion-button expand="block" fill="outline" color="success" @click="takePhoto">
📸 Take Photo
</ion-button>

<br>

<ion-item>
<ion-label>Health Status</ion-label>

<ion-select v-model="newPlant.status">

<ion-select-option value="healthy">Healthy</ion-select-option>
<ion-select-option value="warning">Warning</ion-select-option>
<ion-select-option value="critical">Critical</ion-select-option>

</ion-select>

</ion-item>

<br>

<ion-item>
<ion-label>Date</ion-label>

<ion-datetime
presentation="date-time"
v-model="newPlant.datetime">
</ion-datetime>

</ion-item>

<br>

<ion-textarea
label="Notes"
label-placement="floating"
fill="outline"
v-model="newPlant.notes">
</ion-textarea>

<br>

<ion-button expand="block" color="success" @click="savePlant">
💾 Save Plant
</ion-button>

<ion-button expand="block" fill="outline" color="danger" @click="closeModal">
Cancel
</ion-button>

</ion-content>
</ion-modal>

<!-- DETAIL MODAL -->

<ion-modal :is-open="showDetail">

<ion-header>
<ion-toolbar color="success">
<ion-title>🌿 Plant Detail</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<img :src="selectedPlant.image || defaultImage" class="detail-img"/>

<ion-button expand="block" color="success" @click="pickDetailImage">
📁 Change Photo
</ion-button>

<ion-button expand="block" fill="outline" color="success" @click="takeDetailPhoto">
📸 Take New Photo
</ion-button>

<br>

<ion-input
label="Plant Name"
label-placement="floating"
fill="outline"
v-model="selectedPlant.name">
</ion-input>

<br>

<ion-item>
<ion-label>Health Status</ion-label>

<ion-select v-model="selectedPlant.status">
<ion-select-option value="healthy">Healthy</ion-select-option>
<ion-select-option value="warning">Warning</ion-select-option>
<ion-select-option value="critical">Critical</ion-select-option>
</ion-select>

</ion-item>

<br>

<ion-input
label="Height Growth (cm)"
type="number"
fill="outline"
v-model="selectedPlant.height">
</ion-input>

<br>

<ion-item>
<ion-label>Water Status</ion-label>

<ion-select v-model="selectedPlant.water">

<ion-select-option value="watered">
💧 Watered
</ion-select-option>

<ion-select-option value="unwater">
⚠ Needs Water
</ion-select-option>

</ion-select>

</ion-item>

<br>

<ion-button expand="block" color="success" @click="updatePlant">
Update Plant
</ion-button>

<ion-button expand="block" color="danger" @click="deletePlant">
Delete Plant
</ion-button>

<ion-button expand="block" fill="outline" @click="closeDetail">
Close
</ion-button>

</ion-content>
</ion-modal>

</ion-content>
</ion-page>

</template>

<script setup>

import {
IonPage,IonContent,IonCard,IonSearchbar,IonProgressBar,
IonFab,IonFabButton,IonIcon,IonModal,IonButton,IonInput,
IonHeader,IonToolbar,IonTitle,IonSelect,IonSelectOption,
IonItem,IonLabel,IonDatetime,IonTextarea
} from '@ionic/vue'

import { ref, computed, onMounted } from "vue"

import { db } from "../firebase"

import {
collection,getDocs,addDoc,doc,updateDoc,deleteDoc
} from "firebase/firestore"

import { add } from "ionicons/icons"

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"

const plants = ref([])
const search = ref("")

const totalPlants = ref(0)
const healthyCount = ref(0)
const warningCount = ref(0)
const criticalCount = ref(0)

const showModal = ref(false)
const showDetail = ref(false)

const selectedPlant = ref({})
const previewImage = ref("")

const defaultImage =
"https://cdn-icons-png.flaticon.com/512/628/628324.png"

const newPlant = ref({
name:"",
health:100,
status:"healthy",
datetime:"",
notes:"",
image:"",
water:"unwater",
lastWatered:null,
height:0
})

function openModal(){showModal.value=true}
function closeModal(){showModal.value=false}

function openPlantDetail(plant){
selectedPlant.value={...plant}
showDetail.value=true
}

function closeDetail(){showDetail.value=false}

/* CAMERA */

async function takePhoto(){

const photo = await Camera.getPhoto({
quality:90,
resultType:CameraResultType.DataUrl,
source:CameraSource.Camera
})

previewImage.value = photo.dataUrl
newPlant.value.image = photo.dataUrl

}

function pickImage(){

const input=document.createElement("input")
input.type="file"
input.accept="image/*"

input.onchange=e=>{

const file=e.target.files[0]
const reader=new FileReader()

reader.onload=()=>{
previewImage.value=reader.result
newPlant.value.image=reader.result
}

reader.readAsDataURL(file)

}

input.click()

}

/* DETAIL PHOTO */

async function takeDetailPhoto(){

const photo = await Camera.getPhoto({
quality:90,
resultType:CameraResultType.DataUrl,
source:CameraSource.Camera
})

selectedPlant.value.image = photo.dataUrl

}

function pickDetailImage(){

const input=document.createElement("input")
input.type="file"
input.accept="image/*"

input.onchange=e=>{

const file=e.target.files[0]
const reader=new FileReader()

reader.onload=()=>{
selectedPlant.value.image=reader.result
}

reader.readAsDataURL(file)

}

input.click()

}

/* SAVE */

async function savePlant(){

if(!newPlant.value.name) return

await addDoc(collection(db,"plants"),newPlant.value)

closeModal()
loadPlants()

}

/* UPDATE */

async function updatePlant(){

const refDoc=doc(db,"plants",selectedPlant.value.id)

let lastWatered = selectedPlant.value.lastWatered

if(selectedPlant.value.water==="watered"){
lastWatered = new Date().toISOString()
}

await updateDoc(refDoc,{
name:selectedPlant.value.name,
status:selectedPlant.value.status,
height:selectedPlant.value.height,
water:selectedPlant.value.water,
image:selectedPlant.value.image,
lastWatered:lastWatered
})

showDetail.value=false
loadPlants()

}

/* DELETE */

async function deletePlant(){

const refDoc=doc(db,"plants",selectedPlant.value.id)

await deleteDoc(refDoc)

showDetail.value=false
loadPlants()

}

/* WATER CHECK */

function checkWaterStatus(plants){

const now = new Date()

plants.forEach(p=>{

if(!p.lastWatered) return

const last = new Date(p.lastWatered)

const diffHours = (now-last)/(1000*60*60)

if(diffHours>=24){
p.water="unwater"
}

})

}

/* LOAD */

async function loadPlants(){

const snapshot=await getDocs(collection(db,"plants"))

plants.value=snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}))

checkWaterStatus(plants.value)

totalPlants.value=plants.value.length
healthyCount.value=plants.value.filter(p=>p.status==="healthy").length
warningCount.value=plants.value.filter(p=>p.status==="warning").length
criticalCount.value=plants.value.filter(p=>p.status==="critical").length

}

/* FILTER */

const filteredPlants=computed(()=>{

return plants.value.filter(p=>
(p.name||"").toLowerCase()
.includes(search.value.toLowerCase())
)

})

function getHealthColor(status){

if(status==="healthy") return "success"
if(status==="warning") return "warning"
if(status==="critical") return "danger"

return "medium"

}

onMounted(()=>{loadPlants()})

</script>

<style>

.main-bg{
--background:linear-gradient(180deg,#f0fdf4,#dcfce7);
}

.smart-header{
background:linear-gradient(135deg,#16a34a,#4ade80);
color:white;
padding:40px;
border-bottom-left-radius:30px;
border-bottom-right-radius:30px;
}

.plant-card{
border-radius:20px;
margin:15px;
box-shadow:0 10px 25px rgba(0,0,0,0.12);
}

.plant-row{
display:flex;
gap:15px;
padding:15px;
align-items:center;
}

.plant-img{
width:80px;
height:80px;
border-radius:15px;
object-fit:cover;
}

.status{
padding:6px 12px;
border-radius:20px;
font-size:12px;
font-weight:600;
}

.status.healthy{
background:#dcfce7;
color:#166534;
}

.status.warning{
background:#fde68a;
color:#92400e;
}

.status.critical{
background:#fecaca;
color:#991b1b;
}

.image-preview img{
width:120px;
height:120px;
border-radius:15px;
object-fit:cover;
display:block;
margin:auto;
margin-bottom:10px;
}

.detail-img{
width:140px;
height:140px;
border-radius:20px;
object-fit:cover;
display:block;
margin:auto;
margin-bottom:20px;
}

</style>
```
