<template>
<ion-page>

<ion-header>
<ion-toolbar color="success">
<ion-title>🌿 My Plants</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<!-- Weather Info -->

<ion-card class="weather-card">

<ion-card-header>
<ion-card-title>🌦 Water Advice</ion-card-title>
</ion-card-header>

<ion-card-content>

<p v-if="temperature">
Temperature: {{ temperature }}°C</p>

<p v-if="temperature && temperature > 30">
🔥 Hot weather — water plants more often
</p>

<p v-if="temperature && temperature < 25">
💧 Cool weather — normal watering
</p>

</ion-card-content>

</ion-card>


<!-- Growth Chart -->

<ion-card>

<ion-card-header>
<ion-card-title>📊 Growth Chart</ion-card-title>
</ion-card-header>

<ion-card-content>
<canvas id="growthChart" class="growth-chart"></canvas>
</ion-card-content>

</ion-card>


<!-- Plant Grid -->

<div class="plant-grid">

<ion-card
v-for="plant in plants"
:key="plant.id"
class="plant-card">

<img
v-if="plant.image"
:src="plant.image"
class="plant-image"
/>

<ion-card-header>

<ion-card-title class="plant-title">
🌱 {{ plant.name }}
</ion-card-title>

</ion-card-header>

<ion-card-content>

<!-- Plant Health -->

<div class="health-status">

<span
:class="plant.height > 10 ? 'healthy' : 'dry'">

{{ plant.height > 10 ? "🌿 Healthy" : "🌵 Dry" }}

</span>

</div>


<p class="height-text">
Height: {{ plant.height }} cm
</p>


<!-- Growth Progress -->

<ion-progress-bar
:value="plant.height / 100"
color="success">
</ion-progress-bar>


<ion-item class="height-input">
<ion-input
type="number"
v-model="plant.newHeight"
placeholder="Add height">
</ion-input>
</ion-item>


<ion-button
expand="block"
color="success"
@click="updateHeight(plant)">
Update Height
</ion-button>

<ion-button
expand="block"
color="secondary"
@click="loadGrowthHistory(plant.id)">
View Growth
</ion-button>

<ion-button
expand="block"
color="warning"
@click="scheduleWaterReminder(plant)">
Water Reminder
</ion-button>

<ion-button
expand="block"
color="danger"
@click="deletePlant(plant)">
Delete
</ion-button>

</ion-card-content>

</ion-card>

</div>





<!-- Add Plant Modal -->

<ion-modal :is-open="showAdd">

<ion-header>
<ion-toolbar>
<ion-title>Add Plant</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<ion-item>
<ion-input
v-model="newPlant"
placeholder="Plant name">
</ion-input>
</ion-item>

<ion-button expand="block" @click="pickImage">
📷 Take Photo
</ion-button>

<img v-if="imageUrl" :src="imageUrl" class="preview" />

<ion-button expand="block" color="success" @click="addPlant">
Add Plant
</ion-button>

<ion-button expand="block" color="medium" @click="showAdd=false">
Close
</ion-button>

</ion-content>

</ion-modal>

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
IonButton,
IonItem,
IonInput,
IonFab,
IonFabButton,
IonModal,
IonProgressBar
} from '@ionic/vue'

import { ref, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

import { db } from '../firebase'

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
query,
where
} from "firebase/firestore"

import { Camera, CameraResultType } from '@capacitor/camera'
import { LocalNotifications } from '@capacitor/local-notifications'


const plants = ref([])
const newPlant = ref("")
const imageUrl = ref("")
const showAdd = ref(false)

const temperature = ref(null)

let chart


function openAddPlant(){
showAdd.value = true
}


// Camera

async function pickImage(){

const image = await Camera.getPhoto({
quality:90,
allowEditing:false,
resultType:CameraResultType.DataUrl
})

imageUrl.value = image.dataUrl

}


// Weather API

async function loadWeather(){

const res = await fetch(
"https://api.open-meteo.com/v1/forecast?latitude=17.41&longitude=102.79&current_weather=true"
)

const data = await res.json()

temperature.value = data.current_weather.temperature

}


// Load Plants

async function loadPlants(){

const querySnapshot = await getDocs(collection(db,"plants"))

plants.value = querySnapshot.docs.map(d => ({
id:d.id,
...d.data(),
newHeight:null
}))

updateChart()

}


// Add Plant

async function addPlant(){

if(!newPlant.value) return

await addDoc(collection(db,"plants"),{
name:newPlant.value,
height:0,
image:imageUrl.value
})

newPlant.value=""
imageUrl.value=""
showAdd.value=false

loadPlants()

}


// Delete

async function deletePlant(plant){

if(!confirm(`Delete ${plant.name}?`)) return

await deleteDoc(doc(db,"plants",plant.id))

loadPlants()

}


// Update Height

async function updateHeight(plant){

if(!plant.newHeight) return

const newHeight = Number(plant.newHeight)

await updateDoc(doc(db,"plants",plant.id),{
height:newHeight
})

plant.newHeight=null

loadPlants()

}


// Growth History

async function loadGrowthHistory(plantId){

const q = query(
collection(db,"plantGrowth"),
where("plantId","==",plantId)
)

const querySnapshot = await getDocs(q)

const history = querySnapshot.docs.map(doc => doc.data())

chart.data.labels = history.map(h =>
new Date(h.date).toLocaleDateString()
)

chart.data.datasets[0].data = history.map(h => h.height)

chart.update()

}


// Chart

function updateChart(){

if(!chart) return

chart.data.labels = plants.value.map(p=>p.name)
chart.data.datasets[0].data = plants.value.map(p=>p.height)

chart.update()

}


onMounted(async ()=>{

await nextTick()

loadWeather()

const canvas = document.getElementById("growthChart")
const ctx = canvas.getContext("2d")

const gradient = ctx.createLinearGradient(0,0,0,200)

gradient.addColorStop(0,"rgba(76,175,80,0.5)")
gradient.addColorStop(1,"rgba(76,175,80,0)")

chart = new Chart(ctx,{
type:'line',
data:{
labels:[],
datasets:[
{
data:[],
borderColor:"#4CAF50",
backgroundColor:gradient,
borderWidth:3,
tension:0.4,
fill:true,
pointRadius:4
}
]
},
options:{
responsive:true,
maintainAspectRatio:false
}
})

loadPlants()

})

</script>


<style>

.plant-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.plant-card{
border-radius:18px;
overflow:hidden;
box-shadow:0 8px 20px rgba(0,0,0,0.15);
}

.plant-image{
width:100%;
max-height:100px;
object-fit:contain;
background:#f8f8f8;
padding:8px;
border-radius:10px 10px 0 0;
}

.plant-title{
text-align:center;
font-weight:600;
}

.height-text{
font-weight:bold;
color:#2e7d32;
}

.health-status{
text-align:center;
margin-bottom:8px;
}

.healthy{
color:green;
font-weight:bold;
}

.dry{
color:#ff7043;
font-weight:bold;
}

.growth-chart{
height:200px !important;
}

.preview{
width:100%;
margin-top:10px;
border-radius:10px;
}

.weather-card{
margin-bottom:15px;
}

</style>