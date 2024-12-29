<script setup>
import agentStatsAPI from '@/api/v1/agent-stats';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Colors
} from 'chart.js'
import { onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs'
import { alert } from '@/messages';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Colors)

const props = defineProps(['agentId'])

const invocationsChartData = ref({
    labels: [],
    datasets: []
})

const loadAgentDailyInvocations = async () => {
    const loaded = await agentStatsAPI.getDailyInvocations(props.agentId)
    invocationsChartData.value = {
        labels: loaded.days.map((item) => {
            return moment(item * 1000).format("MMM DD")
        }),
        datasets: [
            {
                label: "Users",
                data: loaded.users,
                yAxisID: 'y_users',
                borderColor: '#ffcd56',
                backgroundColor: '#ffcd56',
            },
            {
                label: "Texts",
                data: loaded.llm,
                yAxisID: 'y_invocations',
                borderColor: '#4cc0c0',
                backgroundColor: '#4cc0c0',
            },
            {
                label: "Images",
                data: loaded.sd,
                yAxisID: 'y_invocations',
                borderColor: '#9966ff',
                backgroundColor: '#9966ff',
            },
            {
                label: "Token Transfers",
                data: loaded.token_transfer,
                yAxisID: 'y_invocations',
                borderColor: '#ff6384',
                backgroundColor: '#ff6384',
            }
        ]
    }
}

const invocationsChartOptions = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Memegent Usage',
            color: '#FFF'
        }
    },
    scales: {
        x: {
            border: {
                color: '#666'
            },
            grid: {
                color: '#555',
            },
        },
        y_users: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            grid: {
                color: '#555',
            },
            border: {
                color: '#ffcd56'
            },
            ticks: {
                color: '#ffcd56'
            }
        },
        y_invocations: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
            min: 0,
            border: {
                color: '#4cc0c0'
            },
            ticks: {
                color: '#4cc0c0'
            }
        },
    },
    maintainAspectRatio: false
}

const tokenTransferChartData = ref({
    labels: [],
    datasets: []
})

const loadAgentDailyTokenTransfers = async () => {
    const loaded = await agentStatsAPI.getDailyTransfers(props.agentId)
    tokenTransferChartData.value = {
        labels: loaded.days.map((item) => {
            return moment(item * 1000).format("MMM DD")
        }),
        datasets: [
            {
                label: "Transactions",
                data: loaded.transactions,
                yAxisID: 'y_tx',
                borderColor: '#ffcd56',
                backgroundColor: '#ffcd56',
            },
            {
                label: "Addresses",
                data: loaded.addresses,
                yAxisID: 'y_tx',
                borderColor: '#4cc0c0',
                backgroundColor: '#4cc0c0',
            },
            {
                label: "Amounts",
                data: loaded.amounts,
                yAxisID: 'y_amount',
                borderColor: '#9966ff',
                backgroundColor: '#9966ff',
            }
        ]
    }
}

const tokenTransferChartOptions = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Token Transfers',
            color: '#FFF'
        }
    },
    scales: {
        x: {
            border: {
                color: '#666'
            },
            grid: {
                color: '#555',
            },
        },
        y_tx: {
            display: true,
            position: 'left',
            min: 0,
            grid: {
                color: '#555',
            },
            border: {
                color: '#ffcd56'
            },
            ticks: {
                color: '#ffcd56'
            }
        },
        y_amount: {
            display: true,
            position: 'right',
            min: 0,
            grid: {
                drawOnChartArea: false,
            },
            border: {
                color: '#9966ff'
            },
            ticks: {
                color: '#9966ff'
            }
        }
    },
    maintainAspectRatio: false
}

onMounted(async () => {
    try {
        await loadAgentDailyInvocations()
        await loadAgentDailyTokenTransfers()
    } catch (e) {
        console.error(e)
        alert("Error loading agent stats. Please try again later.", "danger", 5000)
    }
})

</script>
<template>
    <div class="row stats-charts">
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content">
                    <Line :data="invocationsChartData" :options="invocationsChartOptions"></Line>
                </div>
            </div>
        </div>
        <div class="col col-6">
            <div class="stats-panel">
                <div class="stats-panel-bg"></div>
                <div class="stats-panel-content">
                    <Line :data="tokenTransferChartData" :options="tokenTransferChartOptions"></Line>
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
