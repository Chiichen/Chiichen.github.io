<template>
    <div class="blur-text"> {{ text }} </div>
</template>

<script>
export default {
    name: 'BlurText',
    props: {
        text: {
            type: String,
            required: true
        }
    },
};
</script>

<style scoped>
.blur-text {
    color: rgba(0, 0, 0, 0);
    text-shadow: 0 0 10px #000;
    cursor: default;
    transition: color 0.3s ease, text-shadow 0.3s ease;
    display: inline-block
}

.blur-text:hover {
    color: rgba(0, 0, 0, 1);
    text-shadow: none;
    display: inline-block
}
</style>