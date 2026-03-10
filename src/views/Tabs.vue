<template>

<ion-page>

<ion-tabs>

<ion-router-outlet></ion-router-outlet>

<ion-tab-bar slot="bottom" class="custom-tab-bar">

<ion-tab-button tab="Home" href="/tabs/home">
<ion-icon name="home"></ion-icon>
<ion-label>Home</ion-label>
</ion-tab-button>

<ion-tab-button tab="Plants" href="/tabs/plants">
<ion-icon name="leaf"></ion-icon>
<ion-label>Plants</ion-label>
</ion-tab-button>

<ion-tab-button tab="Reports" href="/tabs/reports">
<ion-icon name="bar-chart"></ion-icon>
<ion-label>Reports</ion-label>
</ion-tab-button>

<ion-tab-button tab="Profile" href="/tabs/profile">
<ion-icon name="person"></ion-icon>
<ion-label>Profile</ion-label>
</ion-tab-button>

</ion-tab-bar>

</ion-tabs>

</ion-page>

</template>

<script setup>

import {
IonTabs,
IonTabBar,
IonTabButton,
IonIcon,
IonLabel,
IonPage,
IonRouterOutlet
} from "@ionic/vue"

</script>

<style>

.custom-tab-bar{

height:75px;

padding-bottom:10px;

background:#ffffff;

box-shadow:0 -4px 20px rgba(0,0,0,0.15);

border-top-left-radius:20px;
border-top-right-radius:20px;

}

.custom-tab-bar ion-icon{

font-size:26px;

}

.custom-tab-bar ion-label{

font-size:13px;

margin-top:4px;

}

ion-tab-button{

--color:#6b7280;

--color-selected:#22c55e;

}

</style>