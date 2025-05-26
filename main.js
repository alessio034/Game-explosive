  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let aliasJugador = ""; // Almacena el nombre ingresado por el jugador

    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const explosionSound = document.getElementById('explosionSound');
    const victorySound = document.getElementById('victorySound');
    const deathSound = document.getElementById('deathSound');
    
    const explosionSize = 100; 

    /**
     * inserta los sonidos 
     */
    const sonidoVictoria = new Audio("sound/victorySound.mp3");
    const sonidoMuerte = new Audio("sound/deathSound.wav");

    /**
     *  se agrega la imagen que vamos a agregar al jugador
     */ 
    const iconoJugador = new Image();
    iconoJugador.src = "img/ninja.png"; // Asegúrate que esta ruta es accesible desde el HTML
    /**
     * carga la imagen y se verifica con el load
     */
    iconoJugador.onload = () => {
    //  console.log("Imagen cargada correctamente");
      gameLoop();
    };
    //mensaje si no carga la imagen
    iconoJugador.onerror = () => {
      console.error("No se pudo cargar la imagen.");
    };
    
    /**
     * se agrega la imagen que vamos a agregar la explosion
     */
    const iconoExplosion = new Image();
      iconoExplosion.src = "img/nuclear-explosion.png"; // o una imagen base64 como antes

      // carga la imagen y se verifica con el load
      iconoExplosion.onload = () => {
      //  console.log("Explosión cargada");
      };
      //mensaje si no carga la imagen
      iconoExplosion.onerror = () => {
        console.error("No se pudo cargar el icono de la explosión");
    };
    
    /**
     * contructor del player
     */
    const player = {
      x: 250,
      y: 200,
      size: 40, // sube el tamaño si tu imagen es grande
      color: 'black',
      speed: 5
    };    

    /**
     * contructor de la bomba
     */
    const bomb = { 
      x: 150, 
      y: 200, 
      size: 60, 
      color: 'orange', 
      explosionRadius: 2, 
    exploding: false };

    let level = 1, wins = 0, deaths = 0;
    let gameRunning = false;
    let keys = {};

    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);

    
/**
 * Controles moviles
 */
// Emula las teclas de flechas con botones
document.querySelectorAll('#mobileControls .ctrl').forEach(btn => {
  const key = btn.dataset.dir;

  btn.addEventListener('touchstart', () => keys[key] = true);
  btn.addEventListener('touchend', () => keys[key] = false);

  // Evitar scroll al tocar
  btn.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
});


    /**
     * Actualizacion del jugador 
     */
    function updatePlayer() {
      if (bomb.exploding) return; // evita movimiento durante explosión

      if (keys['ArrowUp']) player.y -= player.speed;
      if (keys['ArrowDown']) player.y += player.speed;
      if (keys['ArrowLeft']) player.x -= player.speed;
      if (keys['ArrowRight']) player.x += player.speed;

      player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
    }
  
    /**
     * dibuja el jugador
     */
    function drawPlayer() {
      if (iconoJugador.complete && iconoJugador.naturalWidth > 0) {
        ctx.drawImage(iconoJugador, player.x, player.y, player.size, player.size);
      } else {
        // Fallback en caso de que la imagen no esté lista
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
      }
    }
    
    /**
     * dibuja la bomba
     */
    function drawBomb() {
      ctx.fillStyle = bomb.color;
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, bomb.size, 0, Math.PI * 2);
      ctx.fill();
    }
    /**
     * coloca la bomba en lugares aleatorios
     */
    function placeBombRandomly() {
      bomb.x = Math.random() * (canvas.width - 2 * bomb.size) + bomb.size;
      bomb.y = Math.random() * (canvas.height - 2 * bomb.size) + bomb.size;
    }
    /**
     * explosion de la bomba ******* falta hacer que se muestre el radio maximo de la explosion el cual se hace mas grande con cada explosion
     */
    function explodeBomb() {
  //console.log("💣 Iniciando explosión");
  bomb.exploding = true;
  bomb.explosionRadius = 0;

  const maxRadius = 50 + level * 5;
  const speed = 10 + level;
//intervalo de la explosion
  const explosionInterval = setInterval(() => {
    bomb.explosionRadius += speed;

    //console.log("🔥 Radio actual:", bomb.explosionRadius);
    drawGame(true);

        const dx = player.x + player.size / 2 - bomb.x;
        const dy = player.y + player.size / 2 - bomb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (bomb.explosionRadius >= maxRadius) {
          clearInterval(explosionInterval);
          bomb.exploding = false;

          if (distance <= maxRadius) {
            deaths++;
            //que suene cuando muere
            sonidoMuerte.play();
            canvas.classList.add('flash');
          } else {
            wins++;
            level++;
            //que suene cuando gane 1 victoria
            sonidoVictoria.play();
          }

          updateStats();

          if (deaths >= 3) {
            gameRunning = false;
            showEndScreen();
          } else {
            setTimeout(() => {
              canvas.classList.remove('flash');
              startExplosionCycle();
            }, 600);//velocidad de la explosion 
          }
        }
      }, 50);//radio inicial
    }

    /**
     * actualiza la barra de victorias y muertes
     */
    function updateStats() {
    document.getElementById('stats').textContent =
      `Nivel: ${level} | Victorias: ${wins} | Muertes: ${deaths}`;
    }

    /**
     * dibuja el juego
     */
    function drawGame(showExplosion = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔴 Mostrar el radio máximo antes de la explosión
  if (!bomb.exploding) {
    const maxRadius = 50 + level * 5;

    ctx.save();
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // línea punteada opcional
    ctx.stroke();
    ctx.restore();
  }

  // 💣 Si está explotando, mostrar efecto
if (bomb.exploding) {
  ctx.save();

  // Gradiente de explosión que crece con el radio
  const gradient = ctx.createRadialGradient(
    bomb.x, bomb.y, 0,
    bomb.x, bomb.y, bomb.explosionRadius
  );
  gradient.addColorStop(0.0, 'rgba(255, 255, 200, 0.9)');
  gradient.addColorStop(0.3, 'rgba(255, 120, 0, 0.7)');
  gradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.4)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  // Círculo de explosión en expansión
  ctx.beginPath();
  ctx.arc(bomb.x, bomb.y, bomb.explosionRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.closePath();

  ctx.restore();


    // Icono de explosión
    ctx.drawImage(
      iconoExplosion,
      bomb.x - explosionSize / 2,
      bomb.y - explosionSize / 2,
      explosionSize,
      explosionSize
    );
  } else {
    // Bomba normal
    ctx.beginPath();
    ctx.arc(bomb.x, bomb.y, bomb.size, 0, Math.PI * 2);
    ctx.fillStyle = bomb.color;
    ctx.fill();
    ctx.closePath();
  }

  drawPlayer(); // siempre al final
}


    /**
     * ciclos del juego
     */
    function gameLoop() {
    if (gameRunning) {
      updatePlayer(); // esto sí puedes condicionar si es necesario
      drawGame();     // siempre dibuja, incluso si hay explosión
    }
    requestAnimationFrame(gameLoop);
    }
  
    /**
     * hace el circulo de la explosion
     */
    function startExplosionCycle() {
    if (!gameRunning) return;
    placeBombRandomly();
    const waitTime = Math.max(1000, 2000 - level * 100);
    setTimeout(() => {
      explodeBomb();
    }, waitTime);
    }

/**
 * este start game permite ingresar el nombre al iniciar
 */
function startGame() {
  aliasJugador = document.getElementById('inputAlias').value.trim();

  if (!aliasJugador) {
    alert("Por favor, ingresa tu nombre antes de comenzar.");
    return;
  }

  startScreen.classList.remove('visible');
  endScreen.classList.remove('visible');
  canvas.style.display = 'block';
  
  // 👈 MOSTRAR CONTROLES MÓVILES AL INICIAR EL JUEGO
  mostrarControlesMoviles();
  
  gameRunning = true;
  updateStats();
  gameLoop();
  startExplosionCycle();
}


    /**
     * muestra la ventana al finalizar el juego
     */
function showEndScreen() {
  endScreen.classList.add('visible');
  canvas.style.display = 'none';
  
  // 👈 OCULTAR CONTROLES MÓVILES AL TERMINAR EL JUEGO
  ocultarControlesMoviles();
  
  guardarNivelMaximo(level);
}


    /**
     * guarda el nivel en la base de datos
     */
 function guardarNivelMaximo(nivel) {
  if (!userId) {
    console.warn("⚠️ Usuario no autenticado todavía.");
    return;
  }

  const ref = db.collection("scores").doc(userId);

  ref.get().then(doc => {
    let nivelAnterior = 0;

    if (doc.exists) {
      const data = doc.data();
      nivelAnterior = typeof data.maxLevel === 'number' ? data.maxLevel : 0;
    }

    if (nivel > nivelAnterior) {
      console.log("📤 Subiendo nuevo nivel:", nivel);
      ref.set({ 
        maxLevel: nivel, 
        alias: aliasJugador  // 👈 Guardar el nombre ingresado
      }, { merge: true });
    } else {
      console.log("🟡 Nivel no supera el anterior:", nivelAnterior);
    }
  }).catch(error => {
    console.error("❌ Error al acceder a Firestore:", error);
  });
}
  
/**
 * funcion que reinicia el juego al recionar reinciar
 */
function restartGame() {
  level = 1;
  wins = 0;
  deaths = 0;
  keys = {};
  updateStats();
  endScreen.classList.remove('visible');
  canvas.style.display = 'block';
  
  // 👈 MOSTRAR CONTROLES MÓVILES AL REINICIAR
  mostrarControlesMoviles();
  
  gameRunning = true;
  player.x = 250;
  player.y = 200;
  gameLoop();
  startExplosionCycle();
  guardarNivelMaximo(level);

  if (userId) {
    const userRef = db.collection("scores").doc(userId);
    userRef.get().then(doc => {
      const prevLevel = doc.exists ? doc.data().maxLevel || 0 : 0;
      if (level > prevLevel) {
        userRef.set({ maxLevel: level }, { merge: true });
      }
    });
  }
}


function mostrarRankingEn(pantalla) {
  const container = document.getElementById('rankingContainer' + pantalla);
  if (!container) return;

  container.innerHTML = "<h3 class='ranking-title'>Top 5</h3>";

  db.collection("scores")
    .orderBy("maxLevel", "desc")
    .limit(5)
    .get()
    .then(snapshot => {
      const table = document.createElement("table");
      table.id = "ranking";
      table.innerHTML = `
        <thead>
          <tr><th>#</th><th>Alias</th><th>Nivel Máximo</th></tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      let index = 1;

      snapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index}</td>
          <td>${data.alias || "SinNombre"}</td>
          <td>${data.maxLevel || 0}</td>`;
        tbody.appendChild(tr);
        index++;
      });

      container.appendChild(table);
    })
    .catch(error => {
      container.innerHTML += `<p>Error al cargar ranking</p>`;
      console.error("Error al cargar ranking:", error);
    });
}


    function mostrarPantallaInicio() {
      document.getElementById('startScreen').classList.add('visible');
      document.getElementById('endScreen').classList.remove('visible');
      mostrarRankingEn('Start');
    }
    /* 
    *se desactiva porque ya no esta en uso
    function mostrarPantallaFinal() {
      document.getElementById('startScreen').classList.remove('visible');
      document.getElementById('endScreen').classList.add('visible');
      mostrarRankingEn('End');
    }*/

    window.onload = () => {
      mostrarRankingEn('Start');
    };

    //function mostrarRanking() {
  //mostrarRankingEn('Start');
  //mostrarRankingEn('Game');
  //mostrarRankingEn('End');
//}

/**
 * Volver al inicio
 */
document.getElementById('btnVolverInicio').addEventListener('click', () => {
  endScreen.classList.remove('visible');
  startScreen.classList.add('visible');
  
  // 👈 OCULTAR CONTROLES MÓVILES AL VOLVER AL INICIO
  ocultarControlesMoviles();
  
  mostrarRankingEn('Start');
});


/**
 * Controles Nuevos
 */
// 2. Función para mostrar/ocultar controles móviles
function mostrarControlesMoviles() {
  const mobileControls = document.getElementById('mobileControls');
  if (mobileControls) {
    mobileControls.classList.add('visible');
  }
}

function ocultarControlesMoviles() {
  const mobileControls = document.getElementById('mobileControls');
  if (mobileControls) {
    mobileControls.classList.remove('visible');
  }
}
/**
 * Función para detectar si es dispositivo móvil (opcional)
 */
function esDispositivoMovil() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}
/**
 * Inicializar controles móviles mejorados con mejor detección de eventos
 */
function inicializarControlesMoviles() {
  const controles = document.querySelectorAll('#mobileControls .ctrl');
  
  controles.forEach(btn => {
    const key = btn.dataset.dir;
    
    // Touch events
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keys[key] = true;
      btn.style.background = 'rgba(255, 255, 255, 0.3)';
    }, { passive: false });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      keys[key] = false;
      btn.style.background = 'rgba(255, 255, 255, 0.1)';
    }, { passive: false });
    
    // Mouse events para testing en desktop
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      keys[key] = true;
      btn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    
    btn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      keys[key] = false;
      btn.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    btn.addEventListener('mouseleave', (e) => {
      keys[key] = false;
      btn.style.background = 'rgba(255, 255, 255, 0.1)';
    });
  });
}
/**
 * Llamar la inicialización cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  inicializarControlesMoviles();
});
/**
 * HTML actualizado para los controles (usar en tu HTML)
 */



