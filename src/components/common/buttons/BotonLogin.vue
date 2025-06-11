<script setup>
//common/buttons/BotonLogin.vue
import { defineEmits, ref, reactive } from 'vue';

// Estado del diálogo
const dialog = ref(false);
const modoRegistro = ref(false); // false = login, true = registro

// Estados para mostrar/ocultar contraseñas
const mostrarPasswordLogin = ref(false);
const mostrarPasswordRegistro = ref(false);

// Formularios reactivos
const formLogin = reactive({
  email: '',
  password: ''
});

const formRegistro = reactive({
  email: '',
  password: '',
  username: '',
  imagen: null
});

// Validaciones
const validoLogin = ref(true);
const validoRegistro = ref(true);

// Constantes de límites
const LIMITES = {
  EMAIL_MAX: 255,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 128,
  USERNAME_MIN: 2,
  USERNAME_MAX: 50,
  IMAGE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// Funciones de utilidad para validación
const validarUsername = (texto) => {
  // Letras (incluida ñ), números, espacios, guiones (-) y guiones bajos (_)
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_]+$/;
  return regex.test(texto);
};

const validarEmail = (email) => {
  // Regex más estricta para email que detecte dominios obviamente inválidos
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!basicEmailRegex.test(email)) {
    return false;
  }
  
  // Verificar que el dominio no sea obviamente inválido
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const domain = parts[1];
  const domainParts = domain.split('.');
  
  // Verificar que las partes del dominio no sean demasiado largas o contengan solo consonantes
  for (const part of domainParts) {
    if (part.length > 63) return false; // Límite para subdominios
    if (part.length > 10 && !/[aeiouAEIOU]/.test(part)) {
      // Si una parte es muy larga y no tiene vocales, probablemente sea inválida
      return false;
    }
  }
  
  // Verificar que la extensión final sea razonable
  const extension = domainParts[domainParts.length - 1];
  if (extension.length > 10 || !/[aeiouAEIOU]/.test(extension)) {
    return false;
  }
  
  return true;
};

const validarPassword = (password) => {
  // Solo números y letras (sin ñ)
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(password);
};

const tieneEnie = (password) => {
  return /[ñÑ]/.test(password);
};

const sanitizarTexto = (texto) => {
  if (!texto) return '';
  // Remover solo caracteres realmente peligrosos
  return texto
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Reglas de validación mejoradas
const REGLAS_VALIDACION = {
  email: [
    v => !!v || 'El correo es requerido',
    v => (v && v.length <= LIMITES.EMAIL_MAX) || `El correo no puede exceder ${LIMITES.EMAIL_MAX} caracteres`,
    v => validarEmail(v) || 'El formato del correo no es válido o el dominio no existe',
    v => !v.includes('<') && !v.includes('>') || 'El correo contiene caracteres no permitidos'
  ],
  password: [
    v => !!v || 'La contraseña es requerida',
    v => (v && v.length >= LIMITES.PASSWORD_MIN) || `La contraseña debe tener al menos ${LIMITES.PASSWORD_MIN} caracteres`,
    v => (v && v.length <= LIMITES.PASSWORD_MAX) || `La contraseña no puede exceder ${LIMITES.PASSWORD_MAX} caracteres`,
    v => !tieneEnie(v) || 'La contraseña no puede contener la letra ñ',
    v => validarPassword(v) || 'La contraseña solo puede contener letras y números'
  ],
  username: [
    v => !!v || 'El nombre de usuario es requerido',
    v => (v && v.length >= LIMITES.USERNAME_MIN) || `El nombre debe tener al menos ${LIMITES.USERNAME_MIN} caracteres`,
    v => (v && v.length <= LIMITES.USERNAME_MAX) || `El nombre no puede exceder ${LIMITES.USERNAME_MAX} caracteres`,
    v => validarUsername(v) || 'El nombre solo puede contener letras, números, espacios, guiones (-) y guiones bajos (_)',
    v => !v.match(/^\s+|\s+$/g) || 'El nombre no puede empezar o terminar con espacios',
    v => !v.match(/\s{2,}/g) || 'El nombre no puede contener espacios múltiples consecutivos'
  ]
};

// Referencia al input de la imagen
const fileInputRef = ref(null);
// URL de la imagen seleccionada
const imagenURL = ref('');

// Funciones para manejar el diálogo
const abrirLogin = () => {
  modoRegistro.value = false;
  dialog.value = true;
  // Limpiar formularios al abrir
  limpiarFormularios();
};

const cambiarARegistro = () => {
  modoRegistro.value = true;
  // Transferir datos del login al registro si ya están completados y son válidos
  if (formLogin.email && validarEmail(formLogin.email)) {
    formRegistro.email = formLogin.email;
  }
  if (formLogin.password && formLogin.password.length >= LIMITES.PASSWORD_MIN) {
    formRegistro.password = formLogin.password;
  }
};

const cambiarALogin = () => {
  modoRegistro.value = false;
};

const cerrarDialog = () => {
  dialog.value = false;
  limpiarFormularios();
};

const limpiarFormularios = () => {
  // Limpiar formulario de login
  formLogin.email = '';
  formLogin.password = '';
  
  // Limpiar formulario de registro
  formRegistro.email = '';
  formRegistro.password = '';
  formRegistro.username = '';
  formRegistro.imagen = null;
  
  // Limpiar imagen
  quitarImagen();
  
  // Restablecer visibilidad de contraseñas
  mostrarPasswordLogin.value = false;
  mostrarPasswordRegistro.value = false;
};

// Funciones para limpiar campos individuales
const limpiarCampo = (formulario, campo) => {
  formulario[campo] = '';
};

// Función para validar archivo de imagen
const validarImagen = (file) => {
  if (!file) return { valido: true, error: '' };
  
  // Validar tipo de archivo
  if (!LIMITES.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valido: false,
      error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP'
    };
  }
  
  // Validar tamaño
  if (file.size > LIMITES.IMAGE_MAX_SIZE) {
    return {
      valido: false,
      error: `La imagen es demasiado grande. Máximo ${LIMITES.IMAGE_MAX_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Validar dimensiones básicas (opcional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function() {
      if (this.width > 5000 || this.height > 5000) {
        resolve({
          valido: false,
          error: 'Las dimensiones de la imagen son demasiado grandes (máximo 5000x5000px)'
        });
      } else {
        resolve({ valido: true, error: '' });
      }
    };
    img.onerror = function() {
      resolve({
        valido: false,
        error: 'El archivo no es una imagen válida'
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Función para manejar selección de imagen
const seleccionarImagen = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar el archivo
  const validacion = await validarImagen(file);
  
  if (!validacion.valido) {
    alert(validacion.error);
    // Limpiar input
    event.target.value = '';
    return;
  }
  
  formRegistro.imagen = file;
  
  // Liberar URL anterior si existe
  if (imagenURL.value && imagenURL.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagenURL.value);
  }
  
  // Crear URL para la vista previa de la imagen
  try {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      imagenURL.value = URL.createObjectURL(file);
    }
  } catch (error) {
    console.error("Error al crear URL para la imagen:", error);
    imagenURL.value = '';
  }
};

// Función para quitar imagen seleccionada
const quitarImagen = () => {
  // Liberar URL de objeto si existe
  if (imagenURL.value && imagenURL.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagenURL.value);
  }
  
  // Limpiar datos
  imagenURL.value = '';
  formRegistro.imagen = null;
  
  // Limpiar input de archivo
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Función para desencadenar el selector de archivos
const abrirSelectorImagen = () => {
  fileInputRef.value.click();
};

// Funciones para manejar el envío de formularios
const iniciarSesion = () => {
  if (validoLogin.value) {
    // Sanitizar datos antes de enviar
    const datosLogin = {
      email: sanitizarTexto(formLogin.email).toLowerCase(),
      password: formLogin.password // No sanitizar password, podría tener caracteres especiales válidos
    };
    
    emit('login', datosLogin);
    cerrarDialog();
  }
};

const registrarse = () => {
  if (validoRegistro.value) {
    // Sanitizar datos antes de enviar
    const datosRegistro = {
      email: sanitizarTexto(formRegistro.email).toLowerCase(),
      password: formRegistro.password, // No sanitizar password
      username: sanitizarTexto(formRegistro.username),
      imagen: formRegistro.imagen
    };
    
    emit('registro', datosRegistro);
    cerrarDialog();
  }
};

// Definir emisiones
const emit = defineEmits(['login', 'registro']);

// Limpiar URLs de objeto cuando el componente se desmonte
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  if (imagenURL.value && imagenURL.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagenURL.value);
  }
});
</script>

<template>
  <div>
    <!-- Botón que abre el diálogo -->
    <v-btn icon class="custom-circular-btn mr-4" @click="abrirLogin">
      <v-icon>mdi-account</v-icon>
    </v-btn>

    <!-- Diálogo de Login/Registro -->
    <v-dialog v-model="dialog" max-width="500px" fullscreen-breakpoint="sm">
      <v-card class="login-card">
        <v-card-title class="text-h5 bg-primary text-white d-flex align-center">
          <span>{{ modoRegistro ? 'Registrate' : 'Iniciar Sesión' }}</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="cerrarDialog"
            class="d-block d-sm-none"
            color="white"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <!-- Formulario de Login -->
          <v-form v-if="!modoRegistro" v-model="validoLogin" @submit.prevent="iniciarSesion">
            <v-text-field
              v-model="formLogin.email"
              label="Correo Electrónico"
              :rules="REGLAS_VALIDACION.email"
              :maxlength="LIMITES.EMAIL_MAX"
              required
              prepend-icon="mdi-email"
              autocomplete="email"
              type="email"
            ></v-text-field>

            <v-text-field
              v-model="formLogin.password"
              label="Contraseña"
              type="password"
              :rules="REGLAS_VALIDACION.password"
              :maxlength="LIMITES.PASSWORD_MAX"
              required
              prepend-icon="mdi-lock"
              autocomplete="current-password"
            ></v-text-field>
          </v-form>

          <!-- Formulario de Registro -->
          <v-form v-else v-model="validoRegistro" @submit.prevent="registrarse">
            <v-text-field
              v-model="formRegistro.email"
              label="Correo Electrónico"
              :rules="REGLAS_VALIDACION.email"
              :maxlength="LIMITES.EMAIL_MAX"
              required
              prepend-icon="mdi-email"
              autocomplete="email"
              type="email"
            ></v-text-field>

            <v-text-field
              v-model="formRegistro.password"
              label="Contraseña"
              type="password"
              :rules="REGLAS_VALIDACION.password"
              :maxlength="LIMITES.PASSWORD_MAX"
              required
              prepend-icon="mdi-lock"
              autocomplete="new-password"
              hint="Solo letras y números"
              persistent-hint
            ></v-text-field>

            <v-text-field
              v-model="formRegistro.username"
              label="Nombre de Usuario"
              :rules="REGLAS_VALIDACION.username"
              :maxlength="LIMITES.USERNAME_MAX"
              required
              prepend-icon="mdi-account"
              autocomplete="username"
              hint="Solo letras, números, guiones (-) y guiones bajos (_)"
              persistent-hint
            ></v-text-field>

            <v-card class="mb-4 pa-2" outlined>
              <v-card-subtitle class="pb-1">
                Imagen de perfil (opcional) - Máximo {{ LIMITES.IMAGE_MAX_SIZE / (1024 * 1024) }}MB
              </v-card-subtitle>
              <div class="d-flex flex-wrap align-center">
                <v-avatar class="mr-4 mb-2 mb-sm-0" size="64" color="grey lighten-2">
                  <v-img v-if="imagenURL" :src="imagenURL"></v-img>
                  <v-icon v-else size="40">mdi-account</v-icon>
                </v-avatar>
                <v-btn color="primary" @click="abrirSelectorImagen" size="small">
                  Seleccionar imagen
                </v-btn>
                <input
                  ref="fileInputRef"
                  type="file"
                  :accept="LIMITES.ALLOWED_IMAGE_TYPES.join(',')"
                  style="display: none"
                  @change="seleccionarImagen"
                />
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions class="flex-wrap pa-3">
          <v-btn 
            v-if="!modoRegistro" 
            text 
            color="primary"
            @click="cambiarARegistro"
            class="text-caption text-sm-body-2 mb-2 mb-sm-0"
          >
            ¿No tienes cuenta? Regístrate
          </v-btn>
          <v-btn 
            v-else 
            text 
            color="primary" 
            @click="cambiarALogin"
            class="text-caption text-sm-body-2 mb-2 mb-sm-0"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </v-btn>
          <v-spacer></v-spacer>
          <div class="d-flex flex-wrap justify-end">
            <v-btn 
              color="grey" 
              text 
              @click="cerrarDialog"
              class="mr-2 mb-2 mb-sm-0"
            >
              Cancelar
            </v-btn>
            <v-btn 
              v-if="!modoRegistro" 
              color="primary" 
              @click="iniciarSesion" 
              :disabled="!validoLogin"
            >
              Iniciar Sesión
            </v-btn>
            <v-btn 
              v-else 
              color="success" 
              @click="registrarse" 
              :disabled="!validoRegistro"
            >
              Registrarse
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.custom-circular-btn {
  background-color: #F3FE63 !important;
  border: 4px solid #E63737;
  color: white !important;
  border-radius: 50% !important;
  width: 45px !important;
  height: 45px !important;
  min-width: 45px !important;
  min-height: 45px !important;
  padding: 0 !important;
  margin: 0 8px !important;
}

.custom-circular-btn .v-icon {
  font-size: 32px !important;
  color: #E63737 !important;
}

.login-card {
  max-height: 100vh;
  overflow-y: auto;
}

.gap-2 {
  gap: 8px;
}

/* Estilos responsive */
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1.25rem !important;
    padding: 12px 16px !important;
  }
  
  .v-card-text {
    padding: 16px !important;
  }
  
  .v-card-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  
  .v-dialog {
    margin: 0 !important;
  }
}
</style>