<script setup>
//Main.vue
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import GameCard from '@/components/GameCard.vue';
import WelcomeBanner from '@/components/WelcomeBanner.vue';
import { authService } from '../services/auth.js';
import { gamesService } from '../services/games.js';

const router = useRouter();
const searchQuery = ref('');
const currentUser = ref(null);
const isAuthenticated = ref(false);
const error = ref('');
const showError = ref(false);
const loading = ref(false);

// Verificar si hay sesión al cargar
onMounted(() => {
  checkAuthentication();
});

// Computed properties para juegos filtrados
const singlePlayerGames = computed(() => {
  const games = gamesService.getSinglePlayerGames();
  if (!searchQuery.value) return games;
  
  return games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const multiPlayerGames = computed(() => {
  const games = gamesService.getMultiPlayerGames();
  if (!searchQuery.value) return games;
  
  return games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function checkAuthentication() {
  currentUser.value = authService.getCurrentUser();
  isAuthenticated.value = authService.isAuthenticated();
  console.log('Estado de autenticación:', isAuthenticated.value);
  console.log('Datos del usuario:', currentUser.value);
}

function handleImageError() {
  if (currentUser.value) {
    currentUser.value.imagen_url = null;
  }
}

function handleSearchChanged(query) {
  searchQuery.value = query;
}

function navigateToGame(route) {
  router.push(route);
}

const handleLogin = async (datos) => {
  loading.value = true;
  error.value = '';
  showError.value = false;
  
  try {
    const result = await authService.login(datos);
    
    if (result.success) {
      currentUser.value = result.data.user;
      isAuthenticated.value = true;
    } else {
      error.value = result.message;
      showError.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const handleRegister = async (datos) => {
  loading.value = true;
  error.value = '';
  showError.value = false;
  
  try {
    const result = await authService.register(datos);
    
    if (result.success) {
      currentUser.value = result.data.user;
      isAuthenticated.value = true;
    } else {
      error.value = result.message;
      showError.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  authService.logout();
  currentUser.value = null;
  isAuthenticated.value = false;
  console.log('Sesión cerrada');
};
</script>

<template>
  <v-app>
    <Header 
      :isAuthenticated="isAuthenticated"
      :currentUser="currentUser"
      @login="handleLogin"
      @register="handleRegister"
      @logout="handleLogout"
      @image-error="handleImageError"
      @search-changed="handleSearchChanged"
    />

    <v-snackbar v-model="showError" :timeout="5000" color="error" multi-line>
      <div v-if="error.includes('\n')">
        <div v-for="(line, index) in error.split('\n')" :key="index">
          {{ line }}
        </div>
      </div>
      <div v-else>{{ error }}</div>
      <template v-slot:actions>
        <v-btn variant="text" @click="showError = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <v-main class="main-container" style="padding-top: 130px;">
      <v-container fluid class="games-container">
        <WelcomeBanner 
          v-if="isAuthenticated" 
          :user="currentUser" 
          :timeout="5000"
        />

        <v-col cols="12" class="mb-1 mt-2 pt-0">
          <v-sheet
            color="#5829D9"
            class="titulo-mobile ml-2"
          >
            <span class="text-subtitle-1 text-white" style="font-family: 'Acme', sans-serif;">Juegos [Un Solo Jugador]</span>
          </v-sheet>
          <v-divider
            class="linea-decorativa"
            thickness="4"
            color="#8C72D3"
          ></v-divider>
        </v-col>
        
        <v-row class="games-row" dense>
          <v-col 
            v-for="game in singlePlayerGames" 
            :key="game.id"
            cols="6" sm="6" md="4" lg="3" xl="2"
            class="pa-1"
          >
            <GameCard 
              :title="game.title"
              :route="game.route"
              :imageSrc="game.imageSrc"
              @click="navigateToGame"
            />
          </v-col>
        </v-row>

        <v-col cols="12" class="mb-1 mt-2 pt-0">
          <v-sheet
            color="#5829D9"
            class="titulo-mobile ml-2"
          >
            <span class="text-subtitle-1 text-white" style="font-family: 'Acme', sans-serif;">Juegos [Jugador Contra Jugador/Entorno]</span>
          </v-sheet>
          <v-divider
            class="linea-decorativa"
            thickness="4"
            color="#8C72D3"
          ></v-divider>
        </v-col>
      
        <v-row class="games-row" dense>
          <v-col 
            v-for="game in multiPlayerGames" 
            :key="game.id"
            cols="6" sm="6" md="4" lg="3" xl="2"
            class="pa-1"
          >
            <GameCard 
              :title="game.title"
              :route="game.route"
              :imageSrc="game.imageSrc"
              @click="navigateToGame"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
@import '@/assets/styles/main.css';
</style>