<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import agentsAPI from '@/api/v1/agents'
import TheAgent from './TheAgent.vue'
import { alert } from '@/messages'

const router = useRouter()

const listType = ref(router.currentRoute.value.query.list)

if(listType.value != "leaderboard" && listType.value != "discover") {
    listType.value = "discover"
}

const numColumns = ref(0)

const columnItems = reactive([])

const currentPage = ref(0)
const loading = ref(false)
const loadItems = async () => {
    if(loading.value)
        return

    loading.value = true

    try {
        const items = await agentsAPI.getAgents(listType.value, currentPage.value)
        addNextItem(items, 0)
    } catch (e) {
        console.error(e)
        alert("Error loading Memegents. Please try again later.", "danger", 5000)
        loading.value = false
    }
};

const addNextItem = (items, currentIndex) => {
    if (currentIndex >= items.length) {
        loading.value = false
        return
    }

    let shortestHeight = -1
    let shortestColIndex = -1
    for(let i=0; i<numColumns.value; i++) {
        const currentHeight = document.getElementById('memegent-col-' + (i+1)).clientHeight
        if (shortestHeight == -1 || currentHeight < shortestHeight) {
            shortestHeight = currentHeight
            shortestColIndex = i
        }
    }

    columnItems[shortestColIndex].push(items[currentIndex])

    setTimeout(() => {
        addNextItem(items, currentIndex + 1)
    }, 50)
}

const windowResize = () => {
    numColumns.value = getNumColumns()
}

const getNumColumns = () => {
    if (window.innerWidth >= 1400) return 5;
    if (window.innerWidth >= 992) return 4;
    if (window.innerWidth >= 770) return 3;
    return 2
}

watch(numColumns, async () => {
    columnItems.length = 0
    for(let i=0; i<numColumns.value; i++)
    {
        columnItems.push([])
    }
    currentPage.value = 0

    await loadItems()
})

onMounted(() => {
    window.addEventListener('resize', windowResize)
    windowResize()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', windowResize)
})

</script>
<template>
    <div class="container">
        <div class="nav-tabs" style="padding-top: 158px">

        </div>
        <div class="memegent-list row gx-2">
            <div :class="{'col':true, 'col-3': numColumns == 4, 'col-6': numColumns == 2}" v-for="index in numColumns" v-bind:key="index">
                <div :id="'memegent-col-'+index" class="memegent-col-content-wrapper">
                    <the-agent :agent="agent" v-for="agent in columnItems[index - 1]" v-bind:key="agent.id"></the-agent>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.memegent-col-content-wrapper {
    position: relative;
}
</style>
