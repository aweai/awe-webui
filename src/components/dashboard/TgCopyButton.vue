<script setup>
const props = defineProps(['tgUsername'])
import { ref } from 'vue';

const copyAnimating = ref(false)
const copyDone = ref(false)
const copyTG = async () => {
    await navigator.clipboard.writeText("https://t.me/" + props.tgUsername)
    copyDone.value = true
    setTimeout(() => {
        copyAnimating.value = true

        setTimeout(() => {
            copyDone.value = false
            copyAnimating.value = false
        }, 500)

    }, 100)
}

</script>
<template>
<div :class="{'copy': true, 'animating': copyAnimating, 'completed': copyDone}" @click="copyTG">
    <span class="copy-btn"><i class="fa-solid fa-copy"></i></span>
    <span class="copy-check"><i class="fa-solid fa-check"></i></span>
</div>
</template>
<style scoped>
.telegram-link .telegram-link-content .copy {
    position: absolute;
    right: 0;
    top: 0;
    width: 36px;
    height: 36px;
    font-size: 16px;
    line-height: 36px;
    text-align: center;
    cursor: pointer;
}
.telegram-link .telegram-link-content .copy:hover .copy-btn {
    color: white;
}

.telegram-link .telegram-link-content .copy .copy-check,
.telegram-link .telegram-link-content .copy.completed .copy-btn
 {
    display: none
}
.telegram-link .telegram-link-content .copy.completed .copy-check {
    display: inline;
    color: rgba(69, 248, 130);
    opacity: 1;
    transition: opacity .3s linear;
}
.telegram-link .telegram-link-content .copy.animating .copy-check {
    opacity: 0;
}
</style>
