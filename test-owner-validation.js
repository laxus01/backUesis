// Script de prueba para validar las respuestas de identificación duplicada
// Ejecutar con: node test-owner-validation.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Ajustar según tu configuración
const API_URL = `${BASE_URL}/owner`;

async function testOwnerValidation() {
  console.log('🧪 Iniciando pruebas de validación de propietarios...\n');

  // Datos de prueba
  const testOwner = {
    name: 'Juan Pérez',
    identification: 12345678,
    email: 'juan@example.com',
    address: 'Calle 123 #45-67',
    phone: '3001234567'
  };

  try {
    console.log('1️⃣ Creando propietario inicial...');
    const response1 = await axios.post(API_URL, testOwner);
    console.log('✅ Propietario creado exitosamente:', response1.data);
    console.log('');

    console.log('2️⃣ Intentando crear propietario con identificación duplicada...');
    try {
      const duplicateOwner = {
        ...testOwner,
        name: 'María García',
        email: 'maria@example.com'
      };
      
      const response2 = await axios.post(API_URL, duplicateOwner);
      console.log('❌ ERROR: Se permitió crear propietario duplicado');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ Validación exitosa - Identificación duplicada detectada');
        console.log('📋 Respuesta del servidor:', JSON.stringify(error.response.data, null, 2));
        
        // Verificar que contiene el código específico
        if (error.response.data.error === 'IDENTIFICATION_ALREADY_EXISTS') {
          console.log('✅ Código específico correcto: IDENTIFICATION_ALREADY_EXISTS');
        } else {
          console.log('❌ Código específico incorrecto o faltante');
        }
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }
    console.log('');

    console.log('3️⃣ Probando creación masiva con identificaciones duplicadas...');
    const bulkData = [
      {
        name: 'Carlos López',
        identification: 87654321,
        email: 'carlos@example.com',
        address: 'Carrera 10 #20-30',
        phone: '3009876543'
      },
      {
        name: 'Ana Rodríguez',
        identification: 12345678, // Duplicada
        email: 'ana@example.com',
        address: 'Avenida 15 #25-35',
        phone: '3005555555'
      },
      {
        name: 'Luis Martínez',
        identification: 11111111,
        email: 'luis@example.com',
        address: 'Calle 50 #60-70',
        phone: '3007777777'
      }
    ];

    const bulkResponse = await axios.post(`${API_URL}/bulk`, bulkData);
    console.log('📊 Resultado de creación masiva:');
    console.log(`✅ Creados: ${bulkResponse.data.created.length}`);
    console.log(`❌ Fallidos: ${bulkResponse.data.failed.length}`);
    
    if (bulkResponse.data.failed.length > 0) {
      console.log('📋 Detalles de fallos:');
      bulkResponse.data.failed.forEach((fail, index) => {
        console.log(`   ${index + 1}. ${fail.reason} (ID: ${fail.identification})`);
        console.log(`      Código: ${fail.error}`);
      });
    }

  } catch (error) {
    console.log('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.log('📋 Respuesta del servidor:', error.response.data);
    }
  }

  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar las pruebas
testOwnerValidation();
