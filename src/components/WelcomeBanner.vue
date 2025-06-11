<script setup>
//WelcomeBanner.vue
import { ref, onMounted } from 'vue';

const props = defineProps({
  user: Object,
  timeout: {
    type: Number,
    default: 5000
  }
});

const visible = ref(true);

function handleImageError() {
  console.log('Error al cargar la imagen');
  if (props.user) {
    props.user.imagen_url = null;
  }
}

onMounted(() => {

  setTimeout(() => {
    visible.value = false;
  }, props.timeout);
});
</script>

<template>
  <v-slide-y-transition>
    <v-row v-if="visible">
      <v-col cols="12">
        <v-alert
          color="#5829D9"
          border="start"
          elevation="2"
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-avatar size="36" class="mr-3" color="primary">
              <v-img 
                v-if="user?.imagen_url" 
                :src="user.imagen_url" 
                alt="avatar"
                @error="handleImageError"
              ></v-img>
              <span v-else>{{ user?.username?.charAt(0).toUpperCase() || 'U' }}</span>
            </v-avatar>
            <div>
              <span class="text-h6 text-white">¡Bienvenido, {{ user?.username || 'Usuario' }}!</span>
              <p class="text-white mb-0">Ahora puedes acceder a todos los juegos y guardar tus puntuaciones.</p>
            </div>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-slide-y-transition>
</template>