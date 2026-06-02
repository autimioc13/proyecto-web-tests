# Fase 6.4 - XP & Leaderboards Implementation

## Archivos Creados

### 1. `src/lib/xp-calculator.ts`
Utilidades para calcular y formatear XP:

- **calculateXPPercentage(currentXP, nextLevelXP)**: Calcula el porcentaje de progreso hacia el siguiente nivel (0-100)
- **getLevelXPInfo(currentLevel)**: Retorna información de XP para un nivel específico
- **formatXP(xp)**: Formatea números XP para visualización (1.2K, 1M, etc.)

**Uso:**
```typescript
import { calculateXPPercentage, formatXP } from '@/lib/xp-calculator';

const percentage = calculateXPPercentage(750, 1000); // 75%
const formatted = formatXP(1500); // "1.5K"
```

### 2. `src/components/leaderboards/LeaderboardTable.tsx`
Componente que renderiza el top 10 usuarios del leaderboard:

**Características:**
- Muestra rank 1-10 con medallas (🥇🥈🥉)
- Avatar placeholder con iniciales del usuario
- Nombre, XP, level, badges count
- Animación de entrada en cascada
- Carga de datos desde `getLeaderboard()`

**Props:**
- `limit?: number` (default: 10) - Cantidad de usuarios a mostrar
- `showAnimation?: boolean` (default: false) - Activar animación de entrada

**Uso:**
```typescript
import { LeaderboardTable } from '@/components/leaderboards';

export default function LeaderboardPage() {
  return <LeaderboardTable limit={10} showAnimation={true} />;
}
```

### 3. `src/components/gamification/XPGain.tsx`
Componente de animación flotante que muestra "+X XP":

**Características:**
- Animación flotante hacia arriba con fade out
- Efecto de brillo (glow pulse)
- Posicionamiento flexible en pantalla

**Props:**
- `amount: number` - Cantidad de XP ganado
- `x?: number` (default: 50) - Posición X en % de pantalla
- `y?: number` (default: 50) - Posición Y en % de pantalla
- `duration?: number` (default: 1500ms) - Duración de la animación
- `onComplete?: () => void` - Callback cuando termina la animación

**Hook useXPGainAnimation():**
```typescript
const { showXPGain, removeXPGain, xpGains } = useXPGainAnimation();

// Mostrar animación
const id = showXPGain(50, 50, 50);

// Remover manualmente
removeXPGain(id);

// Renderizar todas las animaciones
{xpGains.map((gain) => (
  <XPGain
    key={gain.id}
    amount={gain.amount}
    x={gain.x}
    y={gain.y}
    onComplete={() => removeXPGain(gain.id)}
  />
))}
```

**Uso Básico:**
```typescript
'use client';
import { XPGain, useXPGainAnimation } from '@/components/gamification';

export default function QuizResults() {
  const { showXPGain, removeXPGain, xpGains } = useXPGainAnimation();

  const handleScore = (score: number) => {
    showXPGain(score, 50, 50);
  };

  return (
    <>
      <button onClick={() => handleScore(100)}>+100 XP</button>
      {xpGains.map((gain) => (
        <XPGain
          key={gain.id}
          amount={gain.amount}
          x={gain.x}
          y={gain.y}
          onComplete={() => removeXPGain(gain.id)}
        />
      ))}
    </>
  );
}
```

## Integración con Sistema Existente

Estos componentes se integran con:

1. **getLeaderboard()** - Retorna datos del leaderboard desde Supabase
2. **calculateXP()** - Cálculo base de XP en quiz
3. **calculateLevel()** - Cálculo de nivel desde total XP
4. **getXPForNextLevel()** - XP necesario para siguiente nivel

## Animaciones CSS Incluidas

- **slideIn**: Entrada en cascada para filas del leaderboard
- **xpFloatUp**: Movimiento flotante hacia arriba
- **xpGlowPulse**: Efecto de brillo pulsante

## Próximos Pasos

1. Conectar XPGain.tsx en componentes de resultado de quizzes
2. Implementar componente de barra de progreso de XP
3. Agregar vista detallada de leaderboard en página dedicada
