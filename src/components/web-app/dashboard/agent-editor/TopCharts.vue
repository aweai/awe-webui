<script setup>
import InvocationChart from './stats-charts/InvocationChart.vue'
import IncomeChart from './stats-charts/IncomeChart.vue'

const props = defineProps(['agentId'])
</script>
<template>
    <div class="row stats-charts">
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content">
                    <invocation-chart :agent-id="props.agentId"></invocation-chart>
                </div>
            </div>
        </div>
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content">
                    <income-chart :agent-id="props.agentId"></income-chart>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.stats-charts {
    position: relative;
    height: 100%;
}

.stats-panel {
    position: relative;
    height: 100%;
}

.stats-panel .stats-panel-bg {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: #1b242e;
    box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.21);
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    -o-border-radius: 8px;
    -ms-border-radius: 8px;
    border-radius: 8px;
    z-index: 1;
}

.stats-panel .stats-panel-content {
    position: relative;
    z-index: 2;
    padding: 16px;
    height: 100%;
}
</style>
