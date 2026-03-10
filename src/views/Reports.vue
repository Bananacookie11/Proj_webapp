<template>

<ion-page>
<ion-content class="main-bg">

<div class="report-header">
<h1>📊 Reports & Analytics</h1>
<p>Track your plant progress</p>
</div>

<!-- OVERALL HEALTH -->

<div class="health-card">

<div>
<h3>Overall Plant Health</h3>
<h1>{{ overallHealth }}%</h1>
<p>Average plant health</p>
</div>

<div class="trend">
+{{ healthTrend }}%
<p>vs last month</p>
</div>

</div>

<!-- STATS -->

<div class="stats-grid">

<div class="stat-box">
<h2>{{ plants.length }}</h2>
<p>Total Plants</p>
</div>

<div class="stat-box">
<h2>{{ avgGrowth }} cm</h2>
<p>Avg Growth</p>
</div>

</div>

<!-- PIE CHART -->

<ion-card class="chart-card">

<ion-card-header>
<ion-card-title>🌿 Plant Health Distribution</ion-card-title>
</ion-card-header>

<ion-card-content>
<canvas id="healthChart"></canvas>
</ion-card-content>

</ion-card>

<!-- WEEKLY -->

<ion-card class="chart-card">

<ion-card-header>
<ion-card-title>📅 Weekly Activity</ion-card-title>
</ion-card-header>

<ion-card-content>
<canvas id="weeklyChart"></canvas>
</ion-card-content>

</ion-card>

<!-- MONTHLY -->

<ion-card class="report-card">

<ion-card-header>
<ion-card-title>📑 Monthly Reports</ion-card-title>
</ion-card-header>

<ion-card-content>

<div
v-for="month in monthlyReports"
:key="month.name"
class="month-box"
>

<div>
<h3>{{ month.name }}</h3>
<p>{{ month.date }}</p>
</div>

<div class="month-stats">

<div>
<h4>{{ month.plants }}</h4>
<p>Plants</p>
</div>

<div>
<h4>{{ month.health }}%</h4>
<p>Avg Health</p>
</div>

<div>
<h4>{{ month.water }}</h4>
<p>Watering</p>
</div>

</div>

</div>

</ion-card-content>

</ion-card>

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
IonCardContent
} from "@ionic/vue"

import { ref, onMounted } from "vue"

import { db } from "../firebase"

import { collection, getDocs } from "firebase/firestore"

import Chart from "chart.js/auto"

const plants = ref([])
const growthRecords = ref([])

const overallHealth = ref(0)
const healthTrend = ref(0)
const avgGrowth = ref(0)

const monthlyReports = ref([])

let healthChart
let weeklyChart

async function loadData(){

const plantSnap = await getDocs(collection(db,"plants"))
plants.value = plantSnap.docs.map(d=>({ id:d.id,...d.data() }))

const growthSnap = await getDocs(collection(db,"plantGrowth"))
growthRecords.value = growthSnap.docs.map(d=>({ id:d.id,...d.data() }))

calculateStats()
createCharts()
generateReports()

}

function calculateStats(){

if(plants.value.length === 0) return

let healthSum = 0

plants.value.forEach(p=>{
healthSum += Number(p.health) || 0
})

overallHealth.value =
Math.round(healthSum / plants.value.length)

if(growthRecords.value.length > 0){

let growthSum = 0

growthRecords.value.forEach(g=>{
growthSum += Number(g.height) || 0
})

avgGrowth.value =
Math.round(growthSum / growthRecords.value.length)

}

healthTrend.value =
Math.floor(Math.random()*10)

}

function createCharts(){

const healthy =
plants.value.filter(p=>p.status==="healthy").length

const warning =
plants.value.filter(p=>p.status==="warning").length

const critical =
plants.value.filter(p=>p.status==="critical").length

healthChart = new Chart(
document.getElementById("healthChart"),
{
type:"pie",
options:{ responsive:true, maintainAspectRatio:false },
data:{
labels:["Healthy","Warning","Critical"],
datasets:[{
data:[healthy,warning,critical],
backgroundColor:["#22c55e","#f59e0b","#ef4444"]
}]
}
})

weeklyChart = new Chart(
document.getElementById("weeklyChart"),
{
type:"bar",
data:{
labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
datasets:[
{
label:"Watering",
data:[3,2,4,3,5,4,3],
backgroundColor:"#3b82f6"
},
{
label:"Fertilizing",
data:[1,0,2,0,1,2,1],
backgroundColor:"#22c55e"
}
]
}
})

}

function generateReports(){

monthlyReports.value = [

{
name:"January 2026",
date:"Jan 31, 2026",
plants:plants.value.length,
health:overallHealth.value,
water:85
},

{
name:"December 2025",
date:"Dec 31, 2025",
plants:plants.value.length,
health:overallHealth.value-4,
water:78
},

{
name:"November 2025",
date:"Nov 30, 2025",
plants:plants.value.length,
health:overallHealth.value-7,
water:72
}

]

}

onMounted(()=>{
loadData()
})

</script>

<style>

.main-bg{
--background:#f1f5f9;
}

.report-header{
background:linear-gradient(135deg,#16a34a,#22c55e);
color:white;
padding:35px;
border-bottom-left-radius:30px;
border-bottom-right-radius:30px;
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

.report-header h1{
margin:0;
}

.report-header p{
opacity:0.9;
}

.health-card{
margin:18px;
background:linear-gradient(135deg,#22c55e,#16a34a);
color:white;
border-radius:20px;
padding:25px;
display:flex;
justify-content:space-between;
align-items:center;
box-shadow:0 10px 25px rgba(0,0,0,0.15);
}

.health-card h1{
font-size:48px;
margin:0;
}

.trend{
text-align:right;
}

.stats-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:15px;
padding:15px;
}

.stat-box{
background:white;
padding:20px;
border-radius:18px;
text-align:center;
box-shadow:0 8px 20px rgba(0,0,0,0.08);
}

.chart-card{
margin:15px;
border-radius:20px;
box-shadow:0 10px 25px rgba(0,0,0,0.1);
}

.report-card{
margin:15px;
border-radius:20px;
box-shadow:0 10px 25px rgba(0,0,0,0.1);
}

.month-box{
background:#f8fafc;
padding:16px;
border-radius:14px;
margin-bottom:12px;
display:flex;
justify-content:space-between;
align-items:center;
}

.month-stats{
display:flex;
gap:18px;
text-align:center;
}

.month-stats h4{
margin:0;
}

</style>