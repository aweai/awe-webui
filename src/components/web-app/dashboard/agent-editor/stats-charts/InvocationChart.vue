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
import { useAgentStore } from '@/stores/agent';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Colors)

const agentStore = useAgentStore()

const invocationsChartData = ref({
    labels: [],
    datasets: []
})

const loadAgentDailyInvocations = async () => {
    const loaded = await agentStatsAPI.getDailyInvocations(agentStore.currentAgentId)
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
                label: "Token Out",
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
onMounted(async () => {
    try {
        await loadAgentDailyInvocations()
    } catch (e) {
        console.error(e)
        alert("Error loading daily invocation stats. Please try again later.", "danger", 5000)
    }
})

</script>
<template>
    <Line :data="invocationsChartData" :options="invocationsChartOptions"></Line>
</template>
