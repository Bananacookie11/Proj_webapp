<template>
<div>

<h1>Plant Health Log</h1>

<textarea v-model="log" placeholder="Write plant status"></textarea>

<button @click="saveLog">Save</button>

<ul>
<li v-for="l in logs" :key="l">
{{l}}
</li>
</ul>

</div>
</template>

<script setup>
import { ref } from "vue"

const log = ref("")
const logs = ref([])

const saveLog = () => {
logs.value.push(log.value)
log.value=""
}
</script>