<script setup>
// GameCard.vue
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  imageSrc: {
    type: String,
    default: 'https://picsum.photos/600/300'
  },
  isAuthenticated: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click']);

function handleClick() {
  emit('click', props.route);
}
</script>

<template>
  <v-sheet
    :height="$vuetify.display.smAndDown ? 160 : 180"
    :width="$vuetify.display.smAndDown ? 150 : 260"
    elevation="5"
    class="game-card mx-auto"
    rounded="lg"
    @click="handleClick"
  >
    <!-- Imagen de fondo del juego -->
    <v-img
      :src="imageSrc"
      cover
      height="100%"
      width="100%"
    >
      <!-- Etiqueta del juego con el nombre -->
      <div class="game-label">
        <span class="text-white text-subtitle-1 font-weight-bold">
          {{ title }}
        </span>
      </div>
    </v-img>
  </v-sheet>
</template>

<style scoped>
.game-card {
  overflow: hidden;
  border: 3px solid #8C72D3;
  position: relative;
  transition: transform 0.2s ease;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
}

.game-card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.game-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(60, 40, 20, 0.85);
  padding: 4px 10px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: auto;
  min-width: 70%;
}

@media (max-width: 600px) {
  .game-label {
    padding: 3px 8px;
    border-radius: 12px;
    min-width: 80%;
  }
  
  .text-subtitle-1 {
    font-size: 0.85rem !important;
  }
}
</style>