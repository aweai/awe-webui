<script setup>
import { ref } from 'vue'
import { useAgentStore } from '@/stores/agent'
import moment from 'moment';
import config from '@/config.json';
import { alert } from '@/messages';

const sectionOpen = ref(false)
const agentStore = useAgentStore()


const terminate = async () => {
    const currentTimestamp = Date.now() / 1000
    if (currentTimestamp - agentStore.currentAgent.created_at < config.solana.agent_creator_staking_lock * 86400 * 1000) {
        alert("The staking is still locked. You can not terminate the Memegent now.", "danger", 5000)
        return
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
                        <label class="form-label">Staking locked till:</label>
                        <span class="value"><span class="date">{{
                            moment((agentStore.currentAgent.created_at + config.solana.agent_creator_staking_lock *
                                86400) *
                                1000).format("YYYY-MM-DD") }}</span></span>
                    </div>
                    <div class="col col-3">
                        <button class="btn btn-secondary" type="button" @click="terminate">Terminate</button>
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

.section-item .num {
    font-size: 40px;
    margin-left: 24px;
    color: rgba(69, 248, 130);
}

.section-item .date {
    font-size: 24px;
    margin-left: 24px;
    color: rgba(69, 248, 130);
}
</style>
