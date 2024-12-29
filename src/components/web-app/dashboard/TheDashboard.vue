<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
    <div class="container dashboard">
        <div class="row justify-content-center">
            <div class="col col-xxl-8 col-xl-10 col-lg-10 col-md-12 col-sm-12">
                <div v-if="userStore.signedIn">
                    <router-view />
                </div>
                <div v-else>
                    Loading...
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.dashboard {
    margin-top: 160px;
}
.dashboard .page-title {
    position: relative;
    font-family: 'Berlin Sans FB Demi';
    font-size: 40px;
    line-height: 40px;
    font-weight: 800;
    letter-spacing: 3px;
    margin: 0 0;
    color: #fff;
    text-shadow: -1px 3px 0px rgba(69, 248, 130, 0.66);
    text-transform: uppercase;
}
.dashboard .page-title::after
{
    content: "";
    display: block;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px 0px 0px;
}
.dashboard .page-content {
    margin-top: 32px;
}
</style>
