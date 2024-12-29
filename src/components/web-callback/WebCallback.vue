<script setup>

</script>
<template>
    <div class="container web-callback">
        <div class="row justify-content-center">
            <div class="col col-xxl-8 col-xl-10 col-lg-10 col-md-12 col-sm-12">
                <router-view />
            </div>
        </div>
    </div>
</template>
<style>
.web-callback {
    margin-top: 160px;
}
.web-callback .message-box {
    position: relative;
    width: 100%;
    min-height: 200px;
    background-color: #FFF;
    border-radius: 10px;
    overflow: hidden;
    padding: 36px;
    font-family: 'Berlin Sans FB Demi';
}
.web-callback .message-box .title {
    color: #333;
    font-size: 26px;
}
.web-callback .message-box .title::after
{
    content: "";
    display: block;
    background-image: url(/src/assets/images/title_shape.svg);
    width: 65px;
    height: 5px;
    margin: 20px 0px 0px;
}
.web-callback .message-box .message .text {
    text-align: center;
    color: #555;
    margin-top: 48px;
}

.web-callback .message-box .message .loading {
    text-align: center;
    margin: 36px 0;
}
</style>
