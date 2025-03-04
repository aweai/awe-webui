<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import agentsAPI from '@/api/v1/agents'
import TheAgent from './TheAgent.vue'
import { alert } from '@/messages'
import { useElementVisibility } from '@vueuse/core'

const router = useRouter()

const numColumns = ref(0)

const columnItems = reactive([])

const listType = ref("discover")

const updateListType = () => {
    listType.value = router.currentRoute.value.query.list
    if(listType.value != "leaderboard" && listType.value != "discover") {
            listType.value = "discover"
    }
}

const currentPage = ref(0)
const loading = ref(false)
const bottomReached = ref(false)
const bottomLoader = ref(null)
const bottomLoaderVisible = useElementVisibility(bottomLoader)

const loadItems = async () => {
    if(loading.value)
        return

    loading.value = true

    try {
        const items = await agentsAPI.getAgents(listType.value, currentPage.value)
        currentPage.value = currentPage.value + 1

        if(items.length < 20) {
            bottomReached.value = true
        }

        await addNextItem(items, 0)
    } catch (e) {
        console.error(e)
        alert("Error loading Memegents. Please try again later.", "danger", 5000)
        loading.value = false
    }
};

const addNextItem = async (items, currentIndex) => {
    if (currentIndex >= items.length) {
        loading.value = false

        if(bottomLoaderVisible.value && !bottomReached.value) {
            await loadItems()
        }

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

    setTimeout(async () => {
        await addNextItem(items, currentIndex + 1)
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

const reloadItems = async () => {

    bottomReached.value = false
    columnItems.length = 0
    for(let i=0; i<numColumns.value; i++)
    {
        columnItems.push([])
    }
    currentPage.value = 0

    await loadItems()
};

watch(numColumns, reloadItems)
watch(listType, reloadItems)

onMounted(() => {

    updateListType()

    window.addEventListener('resize', windowResize)
    windowResize()

    watch(() => router.currentRoute.value.query.list, () => {
        updateListType()
    })

    watch(bottomLoaderVisible, async (nowVisible) => {
        if(nowVisible && bottomReached.value === false && currentPage.value !== 0) {
            await loadItems()
        }
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', windowResize)
})

</script>
<template>
    <div class="container">
        <div class="memegents-nav-tabs">
            <router-link :to="{'name': 'memegents', 'query': {'list': 'leaderboard'}, 'replace': true}" :class="{'memegents-nav-tab': true, 'active': listType === 'leaderboard'}">Leaderboard</router-link>
            <div class="divider">|</div>
            <router-link :to="{'name': 'memegents', 'query': {'list': 'discover'}, 'replace': true}" :class="{'memegents-nav-tab': true, 'active': listType === 'discover'}">Discover</router-link>
        </div>
        <div class="memegent-list row g-lg-3 g-sm-2 g-md-2 g-2">
            <div :class="{'col':true, 'col-3': numColumns == 4, 'col-6': numColumns == 2}" v-for="index in numColumns" v-bind:key="index">
                <div :id="'memegent-col-'+index" class="memegent-col-content-wrapper">
                    <the-agent :agent="agent" v-for="agent in columnItems[index - 1]" v-bind:key="agent.id"></the-agent>
                </div>
            </div>
            <div class="page-loading" v-show="!bottomReached" ref="bottomLoader">
                <div class="spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.memegent-col-content-wrapper {
    position: relative;
}
.memegent-list .col {
    z-index: 1
}
.memegent-list .col:hover {
    z-index: 100
}
.testnet-alert {
    position: relative;
    padding-top: 108px;
}
.memegents-nav-tabs {
    margin-bottom: 24px;
    text-align: center;
    padding-top: 128px;
}
.memegents-nav-tab, .memegents-nav-tabs .divider{
    font-size: 30px;
    font-family: 'Berlin Sans FB Demi';
    line-height: 0.8;
    color: #fff;

    text-transform: uppercase;
    display: inline-block;
    cursor: pointer;
}
.memegents-nav-tabs .divider {
    display: inline-block;
    text-align: center;
    margin: 0 24px;
    color: #999;
}
.memegents-nav-tab.active,
.memegents-nav-tab:hover {
    text-shadow: -1px 2px 0px rgba(69, 248, 130, 0.66);
}

.memegents-nav-tab.active::after,
.memegents-nav-tab:hover::after
{
    content: "";
    display: block;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px auto;
}
.page-loading {
    position: relative;
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

@media screen and (min-width:767.01px) and (max-width: 1200px) {
    .memegents-nav-tab {
        font-size: 24px;
    }
}
@media screen and (max-width: 767px) {
    .memegents-nav-tab {
        font-size: 20px;
    }
    .memegents-nav-tabs {
        margin-bottom: 16px;

    }
}
</style>
