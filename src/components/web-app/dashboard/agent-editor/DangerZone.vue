<script setup>
import { ref } from 'vue'
import { useAgentStore } from '@/stores/agent'
import moment from 'moment'
import config from '@/config.json'
import { alert } from '@/messages'
import { useRouter } from "vue-router"

const sectionOpen = ref(false)
const agentStore = useAgentStore()
const router = useRouter()

const confirmTerminate = async () => {
    const currentTimestamp = Date.now() / 1000
    if (currentTimestamp - agentStore.currentAgent.created_at < config.solana.agent_creator_staking_lock * 86400 * 1000) {
        alert("The staking is still locked. You can not terminate the Memegent now.", "danger", 5000)
        return
    }

    const confirmModal = new window.bootstrap.Modal(document.getElementById('confirmTerminate'));
    confirmModal.show()
}

const terminating = ref(false)

const terminateAgent = async () => {

    if(terminating.value)return

    terminating.value = true

    try {
        await agentStore.terminateAgent()
        router.replace({ 'name': 'dashboard' })
    } catch (e) {
        console.error(e)
        alert("Error connecting to the server. Please try again later.", "danger", 5000)
    } finally {
        terminating.value = false
    }
}

</script>
<template>
    <section :class="{ 'config-section': true, 'danger-zone': true, 'open': sectionOpen }">
        <h3 class="section-title" @click="sectionOpen = !sectionOpen">
            <div class="section-completed">
                <i class="fa-solid fa-circle-info"></i>
            </div>
            <div class="text">Danger Zone</div>
            <div class="collapse-toggle">
                <i class="fa-solid fa-chevron-left"></i>
            </div>
        </h3>
        <div class="section-body">
            <div class="mb-3 section-item">
                <div class="row">
                    <div class="col col-9">
                        <label class="form-label">Staking amount:</label>
                        <span class="value"><span class="num">{{ agentStore.currentAgent.staking_amount }}.00</span>
                            AWE</span>
                    </div>
                </div>
            </div>
            <div class="mb-3 section-item">
                <div class="row">
                    <div class="col col-9">
                        <label class="form-label">Created at:</label>
                        <span class="value"><span class="date">{{
                            moment(agentStore.currentAgent.created_at * 1000).format("YYYY-MM-DD") }}</span></span>
                    </div>
                </div>
            </div>
            <div class="mb-3 section-item">
                <div class="row">
                    <div class="col col-9">
                        <label class="form-label">Locked until:</label>
                        <span class="value"><span class="date">{{
                            moment((agentStore.currentAgent.created_at + config.solana.agent_creator_staking_lock *
                                86400) *
                                1000).format("YYYY-MM-DD") }}</span></span>
                    </div>
                    <div class="col col-3" style="text-align: right">
                        <button v-if="!terminating" class="btn btn-secondary terminate-btn" type="button" @click="confirmTerminate">Terminate</button>
                        <div v-if="terminating" class="spinner-border" role="status"
                            style="margin-top: 8px;margin-right: 16px;">
                            <span class="visually-hidden">Terminating...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="awe-modal modal fade" id="confirmTerminate" data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1" aria-labelledby="terminateMemegent" data-bs-theme="light">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="terminateMemegent">Terminate Memegent</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row confirm-message justify-content-center">
                            <div class="col col-10">
                                Your Memegent will no longer be available to the public.
                                Your staking will be returned.
                                This operation can not be reverted.
                            </div>
                        </div>
                        <div class="row confirm-item price-confirm">
                            <div class="col col-1"></div>
                            <div class="col col-7">
                                Staking returned
                            </div>
                            <div class="col col-3 value">
                                <span class="num">{{ agentStore.currentAgent.staking_amount }}.00</span> AWE
                            </div>
                            <div class="col col-1"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-secondary" @click="terminateAgent" data-bs-dismiss="modal"><span>Confirm</span></button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<style scoped>
.danger-zone .section-title .text,
.danger-zone .section-title .section-completed {
    color: #aa242a;
}

#confirmTerminate .num,
.section-item .num,
.section-item .date {
    font-size: 24px;
    margin-left: 24px;
    color: rgba(69, 248, 130);
}
.btn-secondary.terminate-btn {
    background-image: url("@/assets/images/btn-danger.svg")
}

#confirmTerminate .confirm-item {
    margin-top: 32px;
}
</style>
