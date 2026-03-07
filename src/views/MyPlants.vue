<template>

<ion-page>
<ion-content>

<!-- Header -->

<div class="smart-header">
<h1>🌿 My Plants</h1>
<p>Manage your plant collection</p>
</div>

<!-- Search -->

<div class="search-box">
<ion-searchbar
v-model="search"
debounce="300"
placeholder="Search plants..."
></ion-searchbar>
</div>

<!-- Stats -->

<div class="stats">

<span class="stat-pill">
{{ totalPlants }} Plants
</span>

<span class="stat-pill healthy">
{{ healthyCount }} Healthy
</span>

<span class="stat-pill warning">
{{ warningCount }} Warning
</span>

<span class="stat-pill critical">
{{ criticalCount }} Critical
</span>

</div>

<!-- Empty -->

<div v-if="filteredPlants.length === 0" class="no-plants">
🌱 No plants found
</div>

<!-- Plant List -->

<ion-card
v-for="plant in filteredPlants"
:key="plant.id"
class="plant-card"
>

<div class="plant-row">

<img
:src="plant.image || defaultImage"
class="plant-img"
/>

<div class="plant-info">

<h2>{{ plant.name }}</h2>

<ion-progress-bar
:value="plant.health / 100"
:color="getHealthColor(plant.status)"
></ion-progress-bar>

<small class="last-check">
Last check: {{ plant.lastCheck }}
</small>

</div>

<div
class="status"
:class="plant.status"
>
{{ plant.status }}
</div>

</div>

</ion-card>

<!-- Add Button -->

<ion-fab vertical="bottom" horizontal="end" slot="fixed">
<ion-fab-button color="success" @click="openModal">
<ion-icon :icon="add"></ion-icon>
</ion-fab-button>
</ion-fab>

<!-- Add Plant Modal -->

<ion-modal :is-open="showModal">

<ion-header>
<ion-toolbar color="success">
<ion-title>🌱 Add New Plant</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<div class="add-plant-card">

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

<div class="photo-buttons">

<ion-button
expand="block"
color="success"
@click="pickImage"
>

📁 Choose Photo

</ion-button>

<ion-button
expand="block"
fill="outline"
color="success"
@click="takePhoto"
>

📸 Take Photo

</ion-button>

</div>

<br>

<ion-button
expand="block"
color="success"
@click="savePlant"
>

💾 Save Plant

</ion-button>

<ion-button
expand="block"
fill="clear"
color="danger"
@click="closeModal"
>

Cancel

</ion-button>

</div>

</ion-content>

</ion-modal>

</ion-content>
</ion-page>

</template>

<script setup>

import {
IonPage,
IonContent,
IonCard,
IonSearchbar,
IonProgressBar,
IonFab,
IonFabButton,
IonIcon,
IonModal,
IonButton,
IonInput,
IonHeader,
IonToolbar,
IonTitle
} from '@ionic/vue'

import { ref, computed, onMounted } from "vue"

import { db } from "../firebase"

import {
collection,
getDocs,
addDoc
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

const previewImage = ref("")

const newPlant = ref({
name:"",
health:100,
status:"healthy",
lastCheck:"today",
image:""
})

const defaultImage =
"https://cdn-icons-png.flaticon.com/512/628/628324.png"

function openModal(){
showModal.value = true
}

function closeModal(){
showModal.value = false
}

async function takePhoto(){

const photo = await Camera.getPhoto({
quality:90,
allowEditing:false,
resultType:CameraResultType.DataUrl,
source:CameraSource.Camera
})

previewImage.value = photo.dataUrl
newPlant.value.image = photo.dataUrl

}

function pickImage(){

const input = document.createElement("input")
input.type = "file"
input.accept = "image/*"

input.onchange = e => {

const file = e.target.files[0]
const reader = new FileReader()

reader.onload = () => {

previewImage.value = reader.result
newPlant.value.image = reader.result

}

reader.readAsDataURL(file)

}

input.click()

}

async function savePlant(){

if(!newPlant.value.name) return

await addDoc(collection(db,"plants"), newPlant.value)

closeModal()

loadPlants()

newPlant.value = {
name:"",
health:100,
status:"healthy",
lastCheck:"today",
image:""
}

previewImage.value = ""

}

async function loadPlants(){

try{

const snapshot = await getDocs(collection(db,"plants"))

plants.value = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}))

totalPlants.value = plants.value.length

healthyCount.value =
plants.value.filter(p => p.status === "healthy").length

warningCount.value =
plants.value.filter(p => p.status === "warning").length

criticalCount.value =
plants.value.filter(p => p.status === "critical").length

}catch(error){

console.error("Error loading plants:", error)

}

}

const filteredPlants = computed(()=>{

return plants.value.filter(p =>
(p.name || "")
.toLowerCase()
.includes(search.value.toLowerCase())
)

})

function getHealthColor(status){

if(status === "healthy") return "success"
if(status === "warning") return "warning"
if(status === "critical") return "danger"

return "medium"

}

onMounted(()=>{
loadPlants()
})

</script>

<style>

.smart-header{
background: linear-gradient(135deg,#16A34A,#22C55E);
color:white;
padding:30px;
border-bottom-left-radius:30px;
border-bottom-right-radius:30px;
}

.smart-header h1{
margin:0;
font-size:26px;
font-weight:600;
}

.search-box{
padding:15px;
}

.stats{
display:flex;
gap:10px;
padding:0 15px;
margin-bottom:12px;
flex-wrap:wrap;
}

.stat-pill{
background:white;
padding:6px 14px;
border-radius:20px;
font-size:13px;
box-shadow:0 2px 6px rgba(0,0,0,0.08);
}

.stat-pill.healthy{
background:#d1fae5;
color:#065f46;
}

.stat-pill.warning{
background:#fef3c7;
color:#92400e;
}

.stat-pill.critical{
background:#fee2e2;
color:#991b1b;
}

.plant-card{
border-radius:18px;
margin:12px;
box-shadow:0 6px 16px rgba(0,0,0,0.06);
}

.plant-row{
display:flex;
align-items:center;
gap:14px;
padding:12px;
}

.plant-img{

width:80px;
height:80px;

min-width:80px;

border-radius:16px;

object-fit:cover;

background:#f3f4f6;

box-shadow:0 4px 10px rgba(0,0,0,0.12);

}

.plant-info{
flex:1;
}

.plant-info h2{
margin:0;
font-size:16px;
font-weight:600;
}

.last-check{
font-size:12px;
color:#9ca3af;
}

.status{
padding:6px 12px;
border-radius:20px;
font-size:12px;
}

.status.healthy{
background:#d1fae5;
color:#065f46;
}

.status.warning{
background:#fef3c7;
color:#92400e;
}

.status.critical{
background:#fee2e2;
color:#991b1b;
}

.no-plants{
text-align:center;
margin-top:40px;
color:#6b7280;
}

.add-plant-card{
background:white;
padding:20px;
border-radius:20px;
box-shadow:0 8px 24px rgba(0,0,0,0.08);
}

.image-preview{
text-align:center;
margin-bottom:15px;
}

.image-preview img{
width:150px;
height:150px;
object-fit:cover;
border-radius:18px;
box-shadow:0 6px 18px rgba(0,0,0,0.15);
}

.photo-buttons{
display:flex;
flex-direction:column;
gap:10px;
}

</style>