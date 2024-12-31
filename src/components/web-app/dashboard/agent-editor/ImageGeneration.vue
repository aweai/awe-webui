<script setup>
import { ref, watch } from 'vue';
import { useAgentStore } from '@/stores/agent';
const agentStore = useAgentStore()

const agentData = agentStore.currentAgent

const sectionOpen = ref(false)

const loraModelSource = ref("Huggingface")

watch(() => agentData.awe_agent.image_generation_enabled, (enabled) => {
    sectionOpen.value = enabled
});

watch(() => agentData.awe_agent.image_generation_args.lora.model, (modelName) => {
    if (/civitai/.test(modelName)) {
        loraModelSource.value = "Civitai"
    } else {
        loraModelSource.value = "Huggingface"
    }
})

watch(() => agentData.awe_agent.image_generation_args.base_model.name, (modelName) => {
    if (/sdxl-turbo/.test(modelName)) {
        agentData.awe_agent.image_generation_args.scheduler = {
            "method": "EulerAncestralDiscreteScheduler",
            "args": {
                "timestep_spacing": "trailing"
            }
        }
    } else {
        if (agentData.awe_agent.image_generation_args.scheduler) {
            delete agentData.awe_agent.image_generation_args.scheduler
        }
    }
});

</script>
<template>
    <section :class="{ 'config-section': true, 'open': sectionOpen }">

        <h3 class="section-title"
            @click="sectionOpen = !!(agentData.awe_agent.image_generation_enabled && !sectionOpen)">
            <div
                :class="{ 'section-completed': true, 'yes': agentStore.imageReady && agentData.awe_agent.image_generation_enabled, 'no': !agentStore.imageReady || !agentData.awe_agent.image_generation_enabled }">
                <div class="yes">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="no">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
            </div>
            <div class="text">Image Generation</div>
            <div class="section-enabler">
                <div class="form-check form-switch">
                    <input v-model="agentData.awe_agent.image_generation_enabled" class="form-check-input"
                        type="checkbox" role="switch">
                </div>
            </div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>

        <div class="section-body">

            <blockquote class="blockquote">
                <p>
                    Enable the Memegent to send images to the users.
                    When the Memegent decides to send an image, it will generate a prompt describing the image,
                    and use the following model to generate the image.
                    You could use an existing open source model, or fine-tune your own model simply by uploading a few
                    examples.
                </p>
            </blockquote>

            <ul class="nav nav-tabs image-config-nav-tabs justify-content-center" role="tablist">
                <li class="nav-item">
                    <a id="model-nav" class="nav-link active" aria-current="page" href="javascript:void(0)"
                        data-bs-toggle="tab" data-bs-target="#model-config">Open Source Models</a>
                </li>
                <li class="nav-item">
                    <a id="ft-nav" class="nav-link" href="javascript:void(0)" data-bs-toggle="tab"
                        data-bs-target="#ft-config">Model Fine-tuning</a>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade show active" id="model-config" role="tabpanel" aria-labelledby="model-nav"
                    tabindex="0">
                    <label for="base-model" class="form-label">Base model</label>
                    <div class="row">
                        <div class="col col-9">
                            <div class="input-group mb-3 input-group-lg">
                                <input type="text"
                                    :class="{ 'form-control': true, 'is-invalid': agentData.awe_agent.image_generation_args.base_model.name === '' }"
                                    id="base-model"
                                    v-model="agentData.awe_agent.image_generation_args.base_model.name" />
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">{{
                                        !agentData.awe_agent.image_generation_args.base_model.variant && "Default" || "FP16"
                                    }}</button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="javascript:void(0)"
                                            @click="agentData.awe_agent.image_generation_args.base_model.variant = ''">Default</a>
                                    </li>
                                    <li><a class="dropdown-item" href="javascript:void(0)"
                                            @click="agentData.awe_agent.image_generation_args.base_model.variant = 'fp16'">FP16</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col col-3">
                            <button class="btn btn-secondary">Test</button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="extra-image-prompt" class="form-label">Extra prompt</label>
                        <textarea
                            placeholder="Prompt that will be automatically appended to the AI-generated prompt when generating images"
                            class="form-control" id="extra-image-prompt" rows="3"
                            v-model="agentData.awe_agent.image_generation_args.prompt"></textarea>
                    </div>

                    <label for="lora-model" class="form-label">LoRA model</label>
                    <div class="row">
                        <div class="col col-9">
                            <div class="input-group input-group-lg mb-3">
                                <button class="btn btn-outline-secondary dropdown-toggle" type="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">{{ loraModelSource }}</button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="javascript:void(0)"
                                            @click="loraModelSource = 'Huggingface'">Huggingface</a></li>
                                    <li><a class="dropdown-item" href="javascript:void(0)"
                                            @click="loraModelSource = 'Civitai'">Civitai</a></li>
                                </ul>
                                <input type="text" class="form-control" id="lora-model"
                                    v-model="agentData.awe_agent.image_generation_args.lora.model">
                            </div>
                        </div>
                        <div class="col col-3">
                            <button class="btn btn-secondary">Test</button>
                        </div>
                    </div>

                    <div class="mb-3"
                        v-if="loraModelSource == 'Huggingface' && agentData.awe_agent.image_generation_args.lora.model !== ''">
                        <label for="lora-hf-filename" class="form-label">LoRA Filename</label>
                        <input v-model="agentData.awe_agent.image_generation_args.lora.weight_file_name" type="text"
                            class="form-control form-control-lg" required>
                    </div>

                    <div class="mb-3 num-slider" v-if="agentData.awe_agent.image_generation_args.lora.model !== ''">
                        <label for="lora-weight" class="form-label">LoRA weight</label>
                        <div class="row">
                            <div class="col col-9 slider">
                                <input type="range" class="form-range" min="1" max="100" id="lora-weight"
                                    v-model="agentData.awe_agent.image_generation_args.lora.weight">
                            </div>
                            <div class="col col-3 number"> {{ agentData.awe_agent.image_generation_args.lora.weight }}
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 num-slider">
                        <label for="steps" class="form-label">Steps</label>
                        <div class="row">
                            <div class="col col-9 slider">
                                <input type="range" class="form-range" min="1" max="80" id="steps"
                                    v-model="agentData.awe_agent.image_generation_args.task_config.steps">
                            </div>
                            <div class="col col-3 number"> {{
                                agentData.awe_agent.image_generation_args.task_config.steps }} </div>
                        </div>
                    </div>

                    <div class="mb-3 num-slider">
                        <label for="cfg" class="form-label">CFG</label>
                        <div class="row">
                            <div class="col col-9 slider">
                                <input type="range" class="form-range" min="0" max="20" id="cfg"
                                    v-model="agentData.awe_agent.image_generation_args.task_config.cfg">
                            </div>
                            <div class="col col-3 number"> {{ agentData.awe_agent.image_generation_args.task_config.cfg
                                }} </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="ft-config" role="tabpanel" aria-labelledby="ft-nav" tabindex="1">
                    <div class="row">
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                        <div class="col col-4">
                            <div class="image-placeholder">Upload</div>
                        </div>
                    </div>
                    <div class="row start-ft">
                        <div class="col col-12">
                            <button class="btn btn-primary"><span>Start Fine-tuning</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<style scoped>
.num-slider .slider {
    padding-top: 10px;
}

.num-slider .number {
    font-size: 24px;
    font-family: 'Berlin Sans FB Demi';
}

.image-config-nav-tabs {
    margin-bottom: 24px;
}

.image-placeholder {
    width: 80%;
    margin: 16px auto;
    height: 300px;
    line-height: 300px;
    text-align: center;
    background-color: #343a40;
    font-size: 24px;
    font-family: 'Berlin Sans FB Demi';
}

.start-ft {
    margin-top: 24px;
}

.start-ft .col {
    text-align: center;
}
</style>
