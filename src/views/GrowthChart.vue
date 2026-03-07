<template>

<div>

<h1>Plant Growth Chart</h1>

<input v-model="height" placeholder="Height (cm)"/>

<button @click="addHeight">Add</button>

<ul>
<li v-for="h in heights" :key="h">
{{h}} cm
</li>
</ul>

</div>

</template>

<script setup>
import { ref } from "vue"

const height = ref("")
const heights = ref([])

const addHeight = () => {
heights.value.push(height.value)
height.value=""
}
</script>