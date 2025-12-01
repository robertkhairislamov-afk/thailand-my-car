import { useBackground } from './BackgroundContext';
import { OceanAccents } from './OceanAccents';
import { FloatingBubbles } from './FloatingBubbles';
import { CausticsBackground } from './backgrounds/CausticsBackground';
import { WavesBackground } from './backgrounds/WavesBackground';
import { DepthLayersBackground } from './backgrounds/DepthLayersBackground';
import { MeshGridBackground } from './backgrounds/MeshGridBackground';
import { MinimalBackground } from './backgrounds/MinimalBackground';

/**
 * DynamicBackground - компонент для отображения выбранного фона
 * Автоматически переключается между разными стилями фона
 */
export function DynamicBackground() {
  const { background } = useBackground();

  switch (background) {
    case 'ocean-accents':
      return (
        <>
          <OceanAccents variant="subtle" />
          <FloatingBubbles count={6} opacity={0.12} />
        </>
      );
    
    case 'caustics':
      return (
        <>
          <CausticsBackground />
          <FloatingBubbles count={4} opacity={0.1} />
        </>
      );
    
    case 'waves':
      return <WavesBackground />;
    
    case 'depth-layers':
      return <DepthLayersBackground />;
    
    case 'mesh-grid':
      return <MeshGridBackground />;
    
    case 'minimal':
      return <MinimalBackground />;
    
    default:
      return (
        <>
          <OceanAccents variant="subtle" />
          <FloatingBubbles count={6} opacity={0.12} />
        </>
      );
  }
}
