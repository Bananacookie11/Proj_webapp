<template>
<ion-page>

<div class="login-bg">

  <div class="logo">
    🌿
    <h1>PlantCare</h1>
    <p>Plant health &growth Management</p>
  </div>

  <div class="card">

    <h2>Welcome Back</h2>

    <ion-item>
      <ion-input
        v-model="email"
        placeholder="Enter your email">
      </ion-input>
    </ion-item>

    <ion-item>
      <ion-input
        type="password"
        v-model="password"
        placeholder="Enter your password">
      </ion-input>
    </ion-item>

    <ion-button expand="block" class="login-btn" @click="login">
      Login
    </ion-button>

    <p class="link">
      Don't have an account?
      <span @click="goRegister">Register</span>
    </p>

  </div>

</div>

</ion-page>
</template>

<script setup>

import {
IonPage,
IonItem,
IonInput,
IonButton
} from '@ionic/vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { auth } from '../firebase'
import { signInWithEmailAndPassword } from "firebase/auth"

const email = ref("")
const password = ref("")

const router = useRouter()

async function login(){

if(!email.value || !password.value){
alert("Please enter email and password")
return
}

try{

await signInWithEmailAndPassword(auth,email.value,password.value)

alert("Login success")

router.push("/tabs/home")

}catch(error){

alert("Login failed")

console.log(error)

}

}

function goRegister(){
router.push("/register")
}

</script>

<style>

.login-bg{
height:100vh;
background:linear-gradient(180deg,#16c96b,#0aa84f);
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
padding:20px;
}

.logo{
text-align:center;
color:white;
margin-bottom:20px;
}

.logo h1{
font-size:32px;
font-weight:bold;
}

.logo p{
font-size:14px;
}

.logo{
font-size:60px;
margin-bottom:10px;
}

.card{
background:white;
padding:25px;
border-radius:20px;
width:100%;
max-width:380px;
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

.card h2{
text-align:center;
margin-bottom:20px;
}

.login-btn{
margin-top:20px;
--background:#0db14b;
}

.link{
text-align:center;
margin-top:15px;
}

.link span{
color:#0db14b;
font-weight:bold;
cursor:pointer;
}

</style>