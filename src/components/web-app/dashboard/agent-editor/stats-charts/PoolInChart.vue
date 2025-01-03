<script setup>
import agentStatsAPI from '@/api/v1/agent-stats'
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
import { onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { alert } from '@/messages'
import moment from 'moment'
import { useAgentStore } from '@/stores/agent'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Colors)

const agentStore = useAgentStore()

const tokenTransferChartData = ref({
    labels: [],
    datasets: []
})

const loadAgentDailyPayments = async () => {
    const loaded = await agentStatsAPI.getDailyPayments(agentStore.currentAgentId)
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
                data: loaded.pool_amounts,
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
            text: 'Game Pool In',
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
        await loadAgentDailyPayments()
    } catch (e) {
        console.error(e)
        alert("Error loading pool in stats. Please try again later.", "danger", 5000)
    }
})

</script>
<template>
    <Line :data="tokenTransferChartData" :options="tokenTransferChartOptions"></Line>
</template>
