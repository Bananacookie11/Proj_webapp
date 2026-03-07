<template>

<ion-page>

<ion-tabs>

<ion-router-outlet></ion-router-outlet>

<ion-tab-bar slot="bottom">

<ion-tab-button tab="home" href="/tabs/home">
<ion-icon name="leaf"></ion-icon>
<ion-label>Home</ion-label>
</ion-tab-button>

<ion-tab-button tab="plants" href="/tabs/plants">
<ion-icon name="leaf"></ion-icon>
<ion-label>Plants</ion-label>
</ion-tab-button>


<ion-tab-button tab="profile" href="/tabs/profile">
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
} from '@ionic/vue'

</script>