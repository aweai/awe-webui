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
                label: "Amount",
                data: loaded.creator_amounts,
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
            text: 'Shares from User Payment',
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
        y: {
            display: true,
            position: 'left',
            min: 0,
            grid: {
                color: '#555',
            },
            border: {
                color: '#9966ff'
            },
            ticks: {
                color: '#9966ff'
            }
        },
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
