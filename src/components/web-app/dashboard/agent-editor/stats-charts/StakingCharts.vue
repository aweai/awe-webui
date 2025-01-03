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

const stakingPoolInChartData = ref({
    labels: [],
    datasets: []
})

const stakingPoolOutChartData = ref({
    labels: [],
    datasets: []
})

const loadAgentDailyStaking = async () => {
    const loaded = await agentStatsAPI.getDailyStaking(agentStore.currentAgentId)
    stakingPoolInChartData.value = {
        labels: loaded.days.map((item) => {
            return moment(item * 1000).format("MMM DD")
        }),
        datasets: [
            {
                label: "Amount",
                data: loaded.in_amounts,
                borderColor: '#ffcd56',
                backgroundColor: '#ffcd56',
            }
        ]
    }

    stakingPoolOutChartData.value = {
        labels: loaded.days.map((item) => {
            return moment(item * 1000).format("MMM DD")
        }),
        datasets: [
            {
                label: "Amount",
                data: loaded.out_amounts,
                borderColor: '#ffcd56',
                backgroundColor: '#ffcd56',
            }
        ]
    }
}

const stakingPoolInChartOptions = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Staking Pool In',
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
                color: '#ffcd56'
            },
            ticks: {
                color: '#ffcd56'
            }
        }
    },
    maintainAspectRatio: false
}

const stakingPoolOutChartOptions = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Staking Pool Out',
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
                color: '#ffcd56'
            },
            ticks: {
                color: '#ffcd56'
            }
        }
    },
    maintainAspectRatio: false
}

onMounted(async () => {
    try {
        await loadAgentDailyStaking()
    } catch (e) {
        console.error(e)
        alert("Error loading pool in stats. Please try again later.", "danger", 5000)
    }
})

</script>
<template>
    <div class="col col-6">
        <Line :data="stakingPoolInChartData" :options="stakingPoolInChartOptions"></Line>
    </div>
    <div class="col col-6">
        <Line :data="stakingPoolOutChartData" :options="stakingPoolOutChartOptions"></Line>
    </div>
</template>
