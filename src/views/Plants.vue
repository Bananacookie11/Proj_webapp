<template>

<ion-page>
<ion-content class="main-bg">

<!-- HEADER -->

<div class="header">
<h1>Dashboard</h1>
<p></p>
</div>

<!-- STATS -->

<div class="stats-grid">

<div class="stat-card">
<div class="icon green">🌿</div>
<h2>{{ plants.length }}</h2>
<p>Total Plants</p>
</div>

<div class="stat-card">
<div class="icon blue">💧</div>
<h2>{{ moisture }}%</h2>
<p>Soil Moisture</p>
</div>

<div class="stat-card">
<div class="icon yellow">☀️</div>
<h2>{{ sunlight }}%</h2>
<p>Sunlight</p>
</div>

<div class="stat-card">
<div class="icon red">🌡</div>
<h2>{{ temperature }}°C</h2>
<p>Temperature</p>
</div>

</div>

<!-- MONTHLY CHART -->

<ion-card class="chart-card">

<ion-card-header>
<ion-card-title>📈 Monthly Growth</ion-card-title>
</ion-card-header>

<ion-card-content>
<canvas id="growthChart" class="growth-chart"></canvas>
</ion-card-content>

</ion-card>

<!-- PLANTS -->

<h2 class="section-title">My Plants</h2>

<div class="plant-grid">

<div
v-for="plant in plants"
:key="plant.id"
class="plant-card"
@click="openPlantDetail(plant)"
>

<img :src="plant.image" class="plant-image"/>

<p class="plant-name">
{{ plant.name }}
</p>

<div class="health-badge" :class="plant.status">
{{ plant.status }}
</div>

<div v-if="isNeedWater(plant)" class="water-alert">
⚠ Needs Water
</div>

</div>

</div>

<!-- PLANT DETAIL -->

<ion-modal :is-open="showDetail">

<ion-header>
<ion-toolbar color="success">
<ion-title>Plant Detail</ion-title>
</ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

<div class="detail-card">

<img :src="selectedPlant.image" class="detail-img"/>

<h2>{{ selectedPlant.name }}</h2>

<div class="health-badge big" :class="selectedPlant.status">
{{ selectedPlant.status }}
</div>

<div v-if="isNeedWater(selectedPlant)" class="water-alert big">
⚠ Needs Water
</div>

<canvas id="plantChart" class="growth-chart"></canvas>

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
IonCardHeader,
IonCardTitle,
IonCardContent,
IonProgressBar,
IonModal,
IonToolbar,
IonTitle,
IonHeader
} from '@ionic/vue'

import { ref, onMounted, nextTick } from 'vue'

import Chart from 'chart.js/auto'

import { db } from '../firebase'

import { collection, getDocs } from "firebase/firestore"

const plants = ref([])

const temperature = ref(0)
const sunlight = ref(0)
const moisture = ref(0)

const showDetail = ref(false)
const selectedPlant = ref({})

let chart
let plantChart

// WEATHER

async function loadWeather(){

const res = await fetch(
"https://api.open-meteo.com/v1/forecast?latitude=17.41&longitude=102.79&current_weather=true"
)

const data = await res.json()

temperature.value = data.current_weather.temperature

}

// ENVIRONMENT SIMULATION

function startEnvironmentSimulation(){

setInterval(()=>{

sunlight.value = Math.floor(Math.random()*40)+60
moisture.value = Math.floor(Math.random()*40)+50

},3000)

}

// LOAD PLANTS

async function loadPlants(){

const snapshot = await getDocs(collection(db,"plants"))

plants.value = snapshot.docs.map(d=>({
id:d.id,
...d.data()
}))

updateChart()

}

// MONTHLY CHART

async function updateChart(){

if(!chart) return

const snapshot = await getDocs(collection(db,"plantGrowth"))

const monthlyData = new Array(12).fill(0)
const counts = new Array(12).fill(0)

snapshot.forEach(doc=>{

const data = doc.data()

const date = new Date(data.date)

const month = date.getMonth()

monthlyData[month]+=data.height
counts[month]++

})

const avg = monthlyData.map((sum,i)=>
counts[i] ? (sum/counts[i]) : 0
)

const months=[
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
]

chart.data.labels=months
chart.data.datasets[0].data=avg
chart.update()

}

// PLANT DETAIL

function openPlantDetail(plant){

selectedPlant.value = plant
showDetail.value = true

setTimeout(()=>{
loadPlantGrowth(plant.id)
},300)

}

// LOAD PLANT GROWTH

async function loadPlantGrowth(plantId){

const snapshot = await getDocs(collection(db,"plantGrowth"))

const data=[]

snapshot.forEach(doc=>{

const d=doc.data()

if(d.plantId===plantId){

data.push({
date:d.date,
height:d.height
})

}

})

const labels=data.map(d=>d.date)
const heights=data.map(d=>d.height)

const canvas=document.getElementById("plantChart")

if(plantChart){
plantChart.destroy()
}

plantChart=new Chart(canvas,{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"Growth",
data:heights,
borderColor:"#22c55e",
borderWidth:3,
tension:0.4
}
]
}
})

}

// WATER CHECK

function isNeedWater(plant){

if(!plant.datetime) return false

const last=new Date(plant.datetime)
const now=new Date()

const diff=(now-last)/(1000*60*60*24)

return diff>2

}

onMounted(async()=>{

await nextTick()

loadWeather()
startEnvironmentSimulation()

const canvas=document.getElementById("growthChart")

chart=new Chart(canvas,{

type:'line',

data:{
labels:[],
datasets:[
{
data:[],
borderColor:"#22c55e",
borderWidth:3,
tension:0.4
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

.main-bg{
--background:#f5f7fb;
}

/* HEADER */

.header{
background:linear-gradient(135deg,#16a34a,#22c55e);
color:white;
padding:35px;
border-bottom-left-radius:30px;
border-bottom-right-radius:30px;
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

.header h1{
margin:0;
font-size:28px;
}

.header p{
margin-top:5px;
opacity:0.9;
}

/* STATS */

.stats-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
padding:15px;
}

.stat-card{
background:white;
border-radius:20px;
padding:20px;
text-align:center;
box-shadow:0 10px 25px rgba(0,0,0,0.08);
}

.icon{
font-size:22px;
margin-bottom:8px;
}

.green{color:#22c55e}
.blue{color:#3b82f6}
.yellow{color:#f59e0b}
.red{color:#ef4444}

/* CHART */

.chart-card{
margin:15px;
border-radius:20px;
box-shadow:0 10px 25px rgba(0,0,0,0.1);
}

.growth-chart{
height:200px !important;
}

/* PLANTS */

.section-title{
padding-left:15px;
margin-top:20px;
font-weight:600;
}

.plant-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
padding:15px;
}

.plant-card{
background:white;
border-radius:18px;
text-align:center;
padding:15px;
box-shadow:0 10px 20px rgba(0,0,0,0.08);
transition:0.2s;
cursor:pointer;
}

.plant-card:hover{
transform:translateY(-5px);
}

.plant-image{
width:100%;
height:100px;
object-fit:contain;
}

.plant-name{
font-weight:600;
margin-top:8px;
}

/* HEALTH */

.health-badge{
margin-top:6px;
padding:4px 10px;
border-radius:20px;
font-size:12px;
font-weight:600;
display:inline-block;
}

.health-badge.healthy{
background:#dcfce7;
color:#166534;
}

.health-badge.warning{
background:#fef3c7;
color:#92400e;
}

.health-badge.critical{
background:#fee2e2;
color:#991b1b;
}

/* WATER */

.water-alert{
margin-top:6px;
color:#dc2626;
font-size:12px;
font-weight:600;
}

/* DETAIL */

.detail-card{
text-align:center;
}

.detail-img{
width:150px;
margin:auto;
display:block;
margin-bottom:15px;
}

.big{
font-size:16px;
padding:8px 16px;
}

</style>