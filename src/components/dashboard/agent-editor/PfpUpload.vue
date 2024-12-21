<script setup>
import { onMounted, ref } from 'vue'
import { alert } from "@/messages"
import userAgentAPI from '@/api/v1/user-agent'

const props = defineProps(['agentId'])

const pfpBase64 = ref("")

const loadPFP = async () => {
    pfpBase64.value = await userAgentAPI.getPFP(props.agentId)
}

const pfpUploadInput = ref(null)
const triggerPFPUpload = () => {
    pfpUploadInput.value.click()
}

const uploading = ref(false)

const uploadPFP = async (event) => {
    if(event.target.files.length === 0) {
        return
    }
    const file = event.target.files[0]
    const filename = file.name;
    const extension = filename.split('.')[filename.split('.').length - 1].toLowerCase();
    const filesize = file.size;

    if (filesize > 2 * 1024 * 1024) {
        alert("File size too large!", "danger", 5000)
        return
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "bmp"]
    if (allowedExtensions.indexOf(extension) === -1) {
        alert("Unsupported file type!", "danger", 5000)
        return
    }

    try {
        uploading.value = true
        await userAgentAPI.uploadPFP(props.agentId, file)
        await loadPFP()

    } catch (e) {
        console.error(e)
        alert("PFP upload failed! Please try again later...", "danger", 5000)
    } finally {
        uploading.value = false
    }
}

onMounted(async () => {
    try {
        await loadPFP()
    } catch (e) {
        console.error(e)
        alert("Failed loading PFP. Please try again later...", "danger", 5000)
    }
})

</script>
<template>
<div class="pfp">
    <img class="placeholder" v-if="pfpBase64 === ''" src="@/assets/images/pfp-placeholder-256.png" />

    <img class="real" v-if="pfpBase64 !== ''" :src="pfpBase64"/>

    <div v-if="!uploading" class="change-pfp-btn" @click="triggerPFPUpload">
        <i class="fa-solid fa-camera-rotate"></i>
    </div>

    <div v-if="uploading" class="change-pfp-btn">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Uploading...</span>
        </div>
    </div>

    <input type="file" style="display: none" ref="pfpUploadInput" @change="uploadPFP" />
</div>
</template>
<style scoped>
.pfp {
    position: relative;
    width: 147px;
    height: 147px;
    margin: 12px auto;
}

.pfp .real {
    position: relative;
    display: block;
    width: 147px;
    height: 147px;
    border-radius: 74px;
    overflow: hidden;
}

.change-pfp-btn {
    position: absolute;
    left: 24px;
    bottom: 0;
    width: 36px;
    height: 36px;
    font-size: 26px;
    line-height: 36px;
    text-align: center;
    cursor: pointer;
    color: rgba(69, 248, 130);
}
</style>
